import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createBuyInBro,
  createBuyInToken,
  getLocalData,
  sendTransaction
} from '@/functions/pactUtils'
import { nameSpace, tokenList } from '@/config'
import { useLotteryStore } from './lottery'
import { useAccount } from '@/composables/account'
import { useKadenaConnectionStore } from './wallets'
import type { IUnsignedCommand } from '@kadena/types'
import { useTxStore } from './transactions'

export interface Order {
  token: string
  tickets: number
  price: number
  luckyNumbers?: Array<number>
  isLoading?: boolean
}

export const useOrderStore = defineStore('order', () => {
  const order = ref<Order | undefined>(undefined)

  function initOrder() {
    order.value = {
      token: 'bro',
      price: 0.01,
      tickets: 1,
      luckyNumbers: [0],
      isLoading: false
    }
  }

  async function setNewToken(token: string, contract: string) {
    const lotteryStore = useLotteryStore()
    order.value!.token = token.toLowerCase()
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
    order.value!.tickets = 1
    order.value!.luckyNumbers = [0]
    order.value!.isLoading = false
  }

  async function getTicketPriceForToken(contract: string) {
    const req = await getLocalData(
      `(${nameSpace}.bro-lottery-helpers.ticket-price-in-fungible ${contract})`
    )
    return req
  }

  function addTicket() {
    order.value!.tickets++
    order.value!.luckyNumbers?.push(0)
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
      if (order.value!.token === 'bro') {
        const tx = createBuyInBro(
          account.account.value!.address,
          order.value!.tickets * order.value!.price,
          `(${nameSpace}.bro-lottery-helpers.buy-ticket-in-bro-batch "${account.account.value!.address}" ${order.value!.luckyNumbers!.length} [${order.value!.luckyNumbers!}])`,
          wallet.wallet!,
          order.value!.luckyNumbers!.length
        )
        const sig = await wallet.sign(tx)
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
    } else {
      if (order.value!.token === 'bro') {
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
        const res = await sendTransaction(sig as IUnsignedCommand)
        if (res?.status === 200) {
          const reqKeys = await res.json()
          transactionStore.addTransaction(reqKeys.requestKeys[0])
        } else {
          const result = await res?.text()
          alert(`Error sending transaction! code: ${res?.status} ${result}`)
        }
      } else {
        // Buy single with kda
        const qualName = tokenList.find(
          (t) => t.symbol === order.value!.token.toUpperCase()
        )!.contract
        const pactCommand =
          order.value!.token === 'kda'
            ? `(${nameSpace}.bro-lottery-helpers.buy-ticket-in-kda "${account.account.value!.address}" ${order.value!.price * order.value!.tickets * 1.05} ${order.value!.luckyNumbers![0]})`
            : `(${nameSpace}.bro-lottery-helpers.buy-ticket-in-fungible ${qualName} "${account.account.value!.address}" ${order.value!.price * order.value!.tickets * 1.05} ${order.value!.luckyNumbers![0]})`
        const tx = await createBuyInToken(
          order.value!.token,
          qualName,
          account.account.value!.address,
          order.value!.price * order.value!.tickets * 1.05,
          pactCommand,
          wallet.wallet!
        )
        const sig = await wallet.sign(tx)
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
    initOrder()
  }

  return { order, initOrder, setNewToken, addTicket, removeTicket, changeLuckyNumber, buyTickets }
})
