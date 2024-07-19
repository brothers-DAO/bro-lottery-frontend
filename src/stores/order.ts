import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createBuyInBro,
  createBuyInToken,
  getBalanceForToken,
  getLocalData,
  sendTransaction
} from '@/functions/pactUtils'
import { nameSpace, tokenList, type kadenaToken } from '@/config'
import { useLotteryStore } from './lottery'
import { useAccount } from '@/composables/account'
import { useKadenaConnectionStore } from './wallets'
import type { IUnsignedCommand } from '@kadena/types'
import { useTxStore } from './transactions'

export interface Order {
  token: kadenaToken
  tickets: number
  price: number
  luckyNumbers?: Array<number>
  isLoading?: boolean
}

export const useOrderStore = defineStore('order', () => {
  const order = ref<Order | undefined>(undefined)
  const tokenBalance = ref<number | undefined>(undefined)

  function initOrder() {
    order.value = {
      token: tokenList[0],
      price: 0.001,
      tickets: 1,
      luckyNumbers: [0],
      isLoading: false
    }
  }

  async function setNewToken(token: string, contract: string) {
    const lotteryStore = useLotteryStore()
    order.value!.token = tokenList.find((e) => e.symbol === token)!
    order.value!.isLoading = true
    if (token === 'BRO') {
      order.value!.price = lotteryStore.currentRound!.price_bro
    } else if (token === 'KDA') {
      order.value!.price = lotteryStore.currentRound!.price_kda!
    }
    // order.value!.token = token
    else {
      try {
        const tokenPrice = await getTicketPriceForToken(contract)
        if (isNaN(tokenPrice)) {
          order.value!.isLoading = undefined
          return
        } else {
          order.value!.price = tokenPrice
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (useAccount().account.value?.isConnected) {
      const balance = await getBalanceForToken(
        order.value!.token,
        useAccount().account.value!.address
      )
      tokenBalance.value = balance
    }
    order.value!.tickets = 1
    order.value!.luckyNumbers = [0]
    order.value!.isLoading = false
  }

  async function getTicketPriceForToken(contract: string) {
    const req = await getLocalData(
      `(${nameSpace}.bro-lottery-helpers.ticket-price-in-fungible ${contract})`
    )

    return req.decimal ? parseFloat(req.decimal) : req
  }

  function addTicket() {
    if (order.value!.tickets < 49) {
      order.value!.tickets++
      order.value!.luckyNumbers?.push(0)
    } else {
      alert('You can only buy a maximum of 49 tickets at once due to gas constraints!')
    }
  }

  function removeTicket() {
    if (order.value!.tickets > 1) {
      order.value!.tickets--
      order.value!.luckyNumbers?.pop()
    }
  }

  function changeLuckyNumber(index: number, up: boolean) {
    if (up && order.value!.luckyNumbers![index] < 9) {
      order.value!.luckyNumbers![index]++
    } else if (!up && order.value!.luckyNumbers![index] > 0) {
      order.value!.luckyNumbers![index]--
    }
  }

  async function buyTickets() {
    const account = useAccount()
    const wallet = useKadenaConnectionStore()
    const transactionStore = useTxStore()
    // Buy batch
    if (order.value!.tickets > 1) {
      if (order.value!.token.symbol === 'BRO') {
        const tx = createBuyInBro(
          account.account.value!.address,
          order.value!.tickets * order.value!.price,
          `(${nameSpace}.bro-lottery-helpers.buy-ticket-in-bro-batch "${account.account.value!.address}" ${order.value!.luckyNumbers!.length} [${order.value!.luckyNumbers!}])`,
          wallet.wallet!,
          order.value!.luckyNumbers!.length
        )
        const sig = await wallet.sign(tx)
        if (sig) {
          //const local = await getLocalResultForTransaction(sig as IUnsignedCommand)
          const res = await sendTransaction(sig as IUnsignedCommand)
          if (res?.status === 200) {
            const reqKeys = await res.json()
            transactionStore.addTransaction(reqKeys.requestKeys[0])
          } else {
            const result = await res?.text()
            alert(`Error sending transaction! code: ${res?.status} ${result}`)
          }
        }
      }
    } else {
      if (order.value!.token.symbol === 'BRO') {
        // Buy single with bro
        const tx = createBuyInBro(
          account.account.value!.address,
          order.value!.tickets * order.value!.price,
          `(${nameSpace}.bro-lottery-helpers.buy-ticket-in-bro "${account.account.value!.address}" ${order.value!.luckyNumbers![0]})`,
          wallet.wallet!,
          1
        )
        const sig = await wallet.sign(tx)
        //const local = await getLocalResultForTransaction(sig as IUnsignedCommand)
        if (sig) {
          const res = await sendTransaction(sig as IUnsignedCommand)
          if (res?.status === 200) {
            const reqKeys = await res.json()
            transactionStore.addTransaction(reqKeys.requestKeys[0])
          } else {
            const result = await res?.text()
            alert(`Error sending transaction! code: ${res?.status} ${result}`)
          }
        }
      } else {
        // Buy single with kda
        const qualName = order.value!.token.contract
        const pactCommand =
          order.value!.token.symbol === 'KDA'
            ? `(${nameSpace}.bro-lottery-helpers.buy-ticket-in-kda "${account.account.value!.address}" ${order.value!.price * order.value!.tickets * 1.05} ${order.value!.luckyNumbers![0]})`
            : `(${nameSpace}.bro-lottery-helpers.buy-ticket-in-fungible ${qualName} "${account.account.value!.address}" ${order.value!.price * order.value!.tickets * 1.05} ${order.value!.luckyNumbers![0]})`
        const tx = await createBuyInToken(
          order.value!.token,
          account.account.value!.address,
          order.value!.price * order.value!.tickets * 1.05,
          pactCommand,
          wallet.wallet!,
          order.value!.luckyNumbers!.length
        )
        const sig = await wallet.sign(tx)
        //const local = await getLocalResultForTransaction(sig as IUnsignedCommand)
        if (sig) {
          const res = await sendTransaction(sig as IUnsignedCommand)
          if (res?.status === 200) {
            const reqKeys = await res.json()
            transactionStore.addTransaction(reqKeys.requestKeys[0])
          } else {
            const result = await res?.text()
            alert(`Error sending transaction! code: ${res?.status} ${result}`)
          }
        }
      }
    }
    initOrder()
  }

  return {
    order,
    tokenBalance,
    initOrder,
    setNewToken,
    addTicket,
    removeTicket,
    changeLuckyNumber,
    buyTickets
  }
})
