import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useKadenaConnectionStore, Wallets } from '@/stores/wallets'
import type { Account } from '@/types/kadena'
import { createEckoWalletSign, type ChainId, type IUnsignedCommand } from '@kadena/client'
import { chain, network } from '@/config'

const networkId = network
const CHAINWEB_NODE = import.meta.env.VITE_CHAINWEB_NODE

interface eckoWallet {
  pubKey?: string
  session?: number
  isConnected: boolean
}

declare const window: {
  kadena?: eckoWalletLib
} & Window

interface eckoWalletLib {
  isKadena: boolean
  request: (request: object) => Promise<object>
}

interface StatusResponse {
  message: string
  account: {
    account: Account
    publicKey: string
  }
  status: string
  connectedSites: string[]
}

interface SignResult {
  status: string
  signedCmd: string
  message: string
}

interface QuickSignData {
  commandSigData: {
    cmd: string
    sigs: {
      pubKey: string
      sig: string | null
    }[]
  }
  outcome: { hash: string; result: 'success' | 'fail' }
}

interface QuickSignResultSuccess {
  status: 'success'
  quickSignData: QuickSignData[]
}

interface QuickSignResultFail {
  status: 'fail'
  message: string
}

export const useEckoWalletStore = defineStore('eckoWallet', () => {
  const kadenaStore = useKadenaConnectionStore()

  const ecko = ref<eckoWallet>({
    pubKey: undefined,
    isConnected: false
  })
  const eckoSign = createEckoWalletSign()

  async function init() {
    if (eckoSign.isInstalled()) {
      const connection = await checkConnection()
      if (connection) {
        ecko.value = {
          pubKey: connection.account.publicKey,
          isConnected: true
        }
        kadenaStore.setAccount(connection.account.account, Wallets.EckoWallet)
      }
    }
  }

  async function checkConnection(): Promise<StatusResponse | false> {
    const status = (await window.kadena?.request({
      method: 'kda_checkStatus',
      networkId
    })) as StatusResponse
    if (status?.message.includes('Connected')) {
      return status
    }
    return false
  }

  async function connect() {
    if (eckoSign.isInstalled()) {
      const connection = await checkConnection()
      if (connection) {
        ecko.value = {
          pubKey: connection.account.publicKey,
          isConnected: true
        }
        kadenaStore.setAccount(connection.account.account, Wallets.EckoWallet)
        return true
      } else {
        await eckoSign.connect(networkId)
        const connection = await checkConnection()
        if (connection && connection.message === 'Connected successfully') {
          ecko.value = {
            pubKey: connection.account.publicKey,
            isConnected: true
          }
          kadenaStore.setAccount(connection.account.account, Wallets.EckoWallet)
          return true
        }
      }
    }
    return false
  }

  async function disconnect() {
    await window.kadena?.request({
      method: 'kda_disconnect',
      networkId
    })
  }

  return { ecko, isAvailable: eckoSign.isInstalled, connect, disconnect, sign: eckoSign, init }
})
