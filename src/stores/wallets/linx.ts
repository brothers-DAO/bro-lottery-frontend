import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useKadenaConnectionStore, Wallets } from '@/stores/wallets'
import type { LinxSignRequest } from '@/functions/pactUtils'
import { chain } from '@/config'
import { useOrderStore } from '../order'

declare global {
  interface Window {
    flutter_inappwebview: any
  }
}

export const useLinxWalletStore = defineStore('linxWallet', () => {
  const kadenaStore = useKadenaConnectionStore()
  const linxWallet = ref({
    account: undefined,
    isConnected: false
  })

  async function connect() {
    try {
      if (linx) {
        // Get Account from Linx
        const account = await linx(newRequest('Account', 'get address', {}, false))
        // Write to store
        kadenaStore.setAccount(account, Wallets.LinxWallet)
        return true
      }
    } catch (error) {
      console.log('Could not find LinxWallet')
    }
  }

  function disconnect() {
    console.log('Disconnecting LinxWallet')
  }

  async function sign(request: LinxSignRequest) {
    const order = useOrderStore()
    const req = requestData(
      request,
      'Buy Bro Lottery Ticket',
      undefined,
      chain,
      'BRO',
      order.order!.tickets * order.order!.price,
      0.0,
      undefined,
      false
    )
    const res = await linx(
      newRequest('Send', 'Approve request for buying BRO lottery ticket(s).', req, true)
    )

    if (res.error) {
      alert(`Problem with signing: ${res.error}`)
    } else {
      return res
    }
  }

  return { linxWallet, connect, sign, disconnect }
})

const linx = (...args: any) => window.flutter_inappwebview.callHandler('LinxWallet', ...args)

const newRequest = function (
  request: string,
  description: string,
  requestData: Object | undefined,
  needsApproval: boolean
) {
  return {
    request: request, // Example: "Buy"
    description: description, // Example: "Wizard #1477"
    data: requestData,
    needsApproval: needsApproval // Example true
  }
}

export const requestData = function (
  signingRequest: LinxSignRequest,
  itemDescription: string,
  imageUrl: string | undefined,
  chainId: number,
  tokenId: string,
  amount: number,
  dappFee: number,
  feeTokenId: string | undefined,
  chainless: boolean
) {
  return {
    signingRequest: signingRequest,
    itemDescription: itemDescription,
    imageUrl: imageUrl,
    chainId: chainId,
    tokenId: tokenId,
    amount: amount,
    dappFee: dappFee,
    feeTokenId: feeTokenId,
    chainless: chainless
  }
}
