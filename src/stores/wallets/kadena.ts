import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type Account, type SigningCommand } from '@/types/kadena'
import { useEckoWalletStore } from '@/stores/wallets'
import { useWCKadenaStore } from '@/stores/wallets'
import { type IUnsignedCommand } from '@kadena/client'
import { getLocalData, type LinxSignRequest } from '@/functions/pactUtils'
import { nameSpace } from '@/config'
import { useLotteryStore } from '../lottery'
import { useTxStore } from '../transactions'
import { useLinxWalletStore } from './linx'
import { useOrderStore } from '../order'

export enum Wallets {
  EckoWallet = 'eckoWallet',
  WalletConnect = 'walletConnect',
  LinxWallet = 'linxWallet'
}

interface KadenaAccount {
  address: Account | undefined
  isConnected: boolean
  pendingTransactions?: Array<string>
  currentTickets?: Array<string>
}
export const useKadenaConnectionStore = defineStore('kadenaConnection', () => {
  const account = ref<KadenaAccount>({
    address: undefined,
    isConnected: false
  })
  const wallet = ref<Wallets | undefined>()
  const showModal = ref(false)

  function setAccount(address: Account, walletType: Wallets) {
    account.value = {
      address,
      isConnected: true
    }
    wallet.value = walletType
    getCurrentTickets()
  }

  async function disconnect() {
    if (wallet.value === Wallets.EckoWallet) {
      await useEckoWalletStore().disconnect()
    } else if (wallet.value === Wallets.WalletConnect) {
      await useWCKadenaStore().disconnect()
    }
    account.value = {
      address: undefined,
      isConnected: false
    }
    wallet.value = undefined
  }

  async function sign(cmd: IUnsignedCommand | LinxSignRequest) {
    if (wallet.value === Wallets.EckoWallet) {
      return useEckoWalletStore()
        .sign(cmd as IUnsignedCommand)
        .catch((error) => {
          console.log(error)
        })
    } else if (wallet.value === Wallets.LinxWallet) {
      const order = useOrderStore()
      const broSale = order.order?.token.symbol === 'BRO'
      if (broSale) {
        return useLinxWalletStore().signForBro(cmd as LinxSignRequest)
      } else {
        return useLinxWalletStore().signForToken(cmd as LinxSignRequest, order.order!.token.symbol)
      }
    } else if (wallet.value === Wallets.WalletConnect) {
      return useWCKadenaStore().signRequest(cmd as SigningCommand)
    } else {
      throw new Error(`Sign not implemented for ${wallet.value}`)
    }
  }

  function addPendingTransaction(tx: string) {
    account.value.pendingTransactions?.push(tx)
  }

  async function getCurrentTickets() {
    const lottery = useLotteryStore()
    if (!lottery.currentRound) {
      await lottery.init()
    }
    const round = lottery.currentRound!.roundID
    if (round) {
      const req = await getLocalData(
        `(filter (where 'account (= "${account.value.address}"))(${nameSpace}.bro-lottery.get-all-tickets "${round}"))`
      )
      if (req.length > 0) {
        account.value.currentTickets = req
      }
    }
  }

  function toggleModal() {
    showModal.value = !showModal.value
  }

  function initWallets() {
    useLinxWalletStore().connect()
    useEckoWalletStore().init()
    const transactions = useTxStore()
    transactions.init()
  }

  initWallets()

  return {
    account,
    wallet,
    setAccount,
    disconnect,
    toggleModal,
    showModal,
    sign,
    addPendingTransaction,
    getCurrentTickets
  }
})
