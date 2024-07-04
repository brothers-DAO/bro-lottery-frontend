import { ref } from 'vue'
import { defineStore } from 'pinia'
import Client from '@walletconnect/sign-client'
import { WalletConnectModal } from '@walletconnect/modal'
// import { getSdkError } from '@walletconnect/utils'
import type { SessionTypes, EngineTypes } from '@walletconnect/types'
import { useKadenaConnectionStore, Wallets } from '@/stores/wallets'
import type { Account, SigningCommand } from '@/types/kadena'

interface wcKadena {
  pubKey: string | undefined
  session: SessionTypes.Struct | undefined
  isConnected: boolean
}

interface wcResponse {
  accounts: Array<wcAccountsPerNetwork>
}

interface wcAccountsPerNetwork {
  publicKey: string
  account: string
  kadenaAccounts: Array<kadenaAccounts>
}

interface kadenaAccounts {
  chains: Array<string>
  contract: string
  name: string
}

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
const relayUrl = import.meta.env.VITE_WALLETCONNECT_RELAY_URL
const walletconnectModal = new WalletConnectModal({
  projectId
})

export const useWCKadenaStore = defineStore('wcKadena', () => {
  const kadenaStore = useKadenaConnectionStore()
  const client = ref<Client | undefined>(undefined)
  const wcKadena = ref<wcKadena>({
    pubKey: undefined,
    session: undefined,
    isConnected: false
  })

  async function connect() {
    client.value = await Client.init({
      projectId,
      relayUrl
    })

    const requiredNameSpaces = {
      kadena: {
        methods: ['kadena_getAccounts_v1', 'kadena_sign_v1', 'kadena_quicksign_v1'],
        chains: ['kadena:mainnet01', 'kadena:testnet04', 'kadena:development'],
        events: []
      }
    }

    if (window.localStorage.getItem('wcKadena') != null) {
      wcKadena.value = JSON.parse(window.localStorage.getItem('wcKadena')!)
    }

    try {
      const { uri, approval } = await client.value.connect({
        pairingTopic: wcKadena.value.session?.pairingTopic,
        requiredNamespaces: requiredNameSpaces
      })

      // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
      if (uri) {
        localStorage.clear()
        walletconnectModal.openModal({ uri })
        console.log('New QR')
      }

      const session = await approval()
      console.log('Established session:', session)
      _subscribeToEvents()
      // Grab account
      if (session.namespaces.kadena.accounts.find((e) => e.includes('mainnet01'))) {
        wcKadena.value = {
          pubKey: session.namespaces.kadena.accounts.find((e) => e.includes('mainnet01'))!,
          isConnected: true,
          session: session
        }

        const accountsRequest = {
          id: 1,
          jsonrpc: '2.0',
          method: 'kadena_getAccounts_v1',
          params: {
            accounts: [
              {
                account: wcKadena.value.pubKey,
                contracts: ['coin']
              }
            ]
          }
        }

        const response: wcResponse = await client.value!.request({
          topic: session.topic,
          chainId: 'kadena:mainnet01',
          request: accountsRequest
        })
        walletconnectModal.closeModal()
        // Grab the first account
        // TODO: Show user all accounts and select?
        window.localStorage.setItem('wcKadena', JSON.stringify(wcKadena.value))
        const acc = response.accounts[0].kadenaAccounts[0].name
        kadenaStore.setAccount(acc as Account, Wallets.WalletConnect)
      }
    } catch (error) {
      console.log('Error: ', error)
      return false
    }

    return true
  }

  async function disconnect() {
    if (client.value != undefined) {
      const disconnectData: EngineTypes.DisconnectParams = {
        topic: wcKadena.value.session!.topic,
        reason: {
          code: 6000,
          message: 'Disconnected by client'
        }
      }
      await client.value.disconnect(disconnectData)
      window.localStorage.removeItem('wcKadena')
    }
    client.value = undefined
  }

  async function signRequest(request: SigningCommand) {
    await connect()

    const newSignRequest = {
      id: 1,
      jsonrpc: '2.0',
      method: 'kadena_sign_v1',
      params: {
        request
      }
    }
    const response: wcResponse = await client.value!.request({
      topic: wcKadena.value.session!.topic,
      chainId: 'kadena:mainnet01',
      request: newSignRequest
    })
    console.log(response)
  }

  const _subscribeToEvents = async () => {
    if (typeof client.value === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }

    client.value.on('session_ping', (args) => {
      console.log('EVENT', 'session_ping', args)
    })

    client.value.on('session_event', (args) => {
      console.log('EVENT', 'session_event', args)
    })

    client.value.on('session_update', ({ topic, params }) => {
      // console.log("EVENT", "session_update", { topic, params })
      // const { namespaces } = params
      // const _session = _client.session.get(topic)
      // const updatedSession = { ..._session, namespaces }
      // onSessionConnected(updatedSession)
      console.log(topic, params)
    })

    client.value.on('session_delete', () => {
      console.log('EVENT', 'session_delete')
    })
  }

  return { wcKadena, connect, disconnect, signRequest }
})