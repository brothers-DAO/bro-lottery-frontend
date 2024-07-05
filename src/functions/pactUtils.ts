import type { ChainId, IUnsignedCommand } from '@kadena/types'
import { network, chain, nameSpace, broAccount } from '@/config'
import type { Account, PactValueWithObject } from '@/types/kadena'
import { Pact as PactClient, createClient } from '@kadena/client'
import Pact from 'pact-lang-api'
import { Wallets } from '@/stores/wallets'

const CHAINWEB_NODE = import.meta.env.VITE_CHAINWEB_NODE
const NETWORK_ID = network

const creationTime = () => Math.round(new Date().getTime() / 1000)

export interface LinxSignRequest {
  code: string
  data?: object
  caps: Array<Caps>
  nonce: string
  chainId: string
  gasLimit: number
  ttl: number
  sender: string
  extraSigners: Array<string>
}

export interface Caps {
  role: string
  description: string
  cap: {
    args: Array<any>
    name: string
  }
}

export const hostAddressGenerator = (options: { chainId: ChainId; networkId: string }) =>
  `${CHAINWEB_NODE}/chainweb/0.0/${options.networkId}/chain/${options.chainId}/pact`

export async function getLocalData(pactCommand: string, data?: Object) {
  const chainId = chain.toString() as ChainId
  const res = await Pact.fetch.local(
    quickLocalCommand(chainId, pactCommand, data),
    hostAddressGenerator({ chainId, networkId: NETWORK_ID })
  )
  if (res.result.status === 'success') {
    return res.result.data
  } else {
    return res.result.error.message
  }
}

const quickLocalCommand = (chainId: string, pactCode: string, data?: object) => {
  return {
    networkId: NETWORK_ID,
    keyPairs: Pact.crypto.genKeyPair(),
    pactCode: pactCode,
    envData: data || {},
    meta: {
      creationTime: creationTime(),
      ttl: 28000,
      gasLimit: 80000,
      chainId,
      gasPrice: 0.0000001,
      sender: 'Bro-Lottery'
    }
  }
}

export function poll(txs: Array<string>) {
  const chainId = chain.toString() as ChainId
  return Pact.fetch.poll(
    {
      requestKeys: txs
    },
    hostAddressGenerator({ chainId, networkId: NETWORK_ID })
  )
}

export function createBuyInBro(
  account: string,
  amount: number,
  pactCommand: string,
  wallet: Wallets,
  tickets: number
) {
  const chainId = chain.toString() as ChainId
  const gasMax = tickets * 3000
  const tx =
    wallet === Wallets.EckoWallet
      ? PactClient.builder
          .execution(pactCommand)
          .addSigner(account.slice(1), (signFor) => [
            signFor(
              `n_5d119cc07ffd5efaef5c7feef9e878f34e3d4652.bro.TRANSFER`,
              account,
              broAccount,
              {
                decimal: `${amount}`
              }
            ),
            signFor(`coin.GAS`)
          ])
          .setMeta({ chainId, gasLimit: gasMax, senderAccount: account })
          .setNetworkId(network)
          .createTransaction()
      : createBroSignRequestV1(pactCommand, amount, account, broAccount, gasMax)

  return tx
}

export async function createBuyInToken(
  token: string,
  qualName: string,
  account: string,
  amount: number,
  pactCommand: string,
  wallet: Wallets
) {
  const salesAccount =
    token === 'kda'
      ? await getLocalData(`(${nameSpace}.bro-lottery-helpers.sales-account-in-kda)`)
      : await getLocalData(
          `(${nameSpace}.bro-lottery-helpers.sales-account-in-fungible ${qualName})`
        )
  const chainId = chain.toString() as ChainId
  const tx =
    wallet === Wallets.EckoWallet
      ? PactClient.builder
          .execution(pactCommand)
          .addSigner(account.slice(1), (signFor) => [
            signFor(`${qualName}.TRANSFER`, account, salesAccount, {
              decimal: `${amount.toFixed(12)}`
            }),
            signFor(`coin.GAS`)
          ])
          .setMeta({ chainId, gasLimit: 8000, senderAccount: account })
          .setNetworkId(network)
          .createTransaction()
      : createTokenSignRequestV1(pactCommand, amount, account, broAccount)
  return tx
}

export async function getLocalResultForTransaction(tx: IUnsignedCommand) {
  const chainId = chain.toString() as ChainId
  const res = await fetch(
    `${CHAINWEB_NODE}/chainweb/0.0/${network}/chain/${chainId}/pact/api/v1/local`,

    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tx)
    }
  )
  console.log(JSON.stringify(await res.json()))
}

function createBroSignRequestV1(
  pactCode: string,
  amount: number,
  account: string,
  broAccount: string,
  gasLimit: number
): LinxSignRequest {
  const signingRequest = {
    code: pactCode,
    caps: [
      {
        role: 'pay gas',
        description: 'pay for gas',
        cap: {
          args: [],
          name: 'coin.GAS'
        }
      },
      {
        role: 'buy bro',
        description: `Buy ${amount} BRO Lottery Tickets`,
        cap: {
          args: [
            account,
            broAccount,
            {
              decimal: `${amount.toFixed(12)}`
            }
          ],
          name: `n_5d119cc07ffd5efaef5c7feef9e878f34e3d4652.bro.TRANSFER`
        }
      }
    ],
    data: {},
    nonce: creationTime().toString(),
    chainId: chain.toString(),
    gasLimit: gasLimit,
    ttl: 600,
    sender: account,
    extraSigners: []
  }
  return signingRequest
}

function createTokenSignRequestV1(
  pactCode: string,
  amount: number,
  account: string,
  broAccount: string
): LinxSignRequest {
  const signingRequest = {
    code: pactCode,
    caps: [
      {
        role: 'pay gas',
        description: 'pay for gas',
        cap: {
          args: [],
          name: 'coin.GAS'
        }
      },
      {
        role: 'buy bro',
        description: `Buy ${amount} BRO Lottery Tickets`,
        cap: {
          args: [
            account,
            broAccount,
            {
              decimal: `${amount}`
            }
          ],
          name: `n_5d119cc07ffd5efaef5c7feef9e878f34e3d4652.bro.TRANSFER`
        }
      }
    ],
    nonce: creationTime().toString(),
    chainId: chain.toString(),
    gasLimit: 3000,
    ttl: 600,
    sender: account,
    extraSigners: []
  }
  return signingRequest
}

export async function sendTransaction(tx: IUnsignedCommand) {
  const chainId = chain.toString() as ChainId
  try {
    const res = await fetch(
      `${CHAINWEB_NODE}/chainweb/0.0/${network}/chain/${chainId}/pact/api/v1/send`,

      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cmds: [tx] })
      }
    )
    if (res.status === 200) {
      return res
    } else {
      const message = await res.text()
      alert(`Error sending transaction: ${message}`)
    }
  } catch (error) {
    alert(`Error sending transaction: ${error}`)
  }
}

export async function getKeyset(
  module: string,
  account: Account,
  chainId: ChainId
): Promise<{ pred: string; keys: string[] }> {
  const { dirtyRead } = createClient(hostAddressGenerator({ chainId, networkId: NETWORK_ID }))
  const tx = PactClient.builder
    .execution(`(try "NOT_FOUND" (at 'guard (${module}.details "${account}")))`)
    .setMeta({ chainId, gasLimit: 1500000 })
    .createTransaction()
  const res = await dirtyRead(tx)

  if (res.result.status === 'success') {
    if (res.result.data === 'NOT_FOUND') {
      return { pred: 'keys-all', keys: [account.slice(2)] }
    } else if (typeof res.result.data === 'object') {
      return res.result.data as PactValueWithObject as { pred: string; keys: string[] }
    } else {
      throw Error(`Error getting keyset: unexpected result ${JSON.stringify(res.result.data)}`)
    }
  } else {
    throw Error(`Error getting keyset: ${JSON.stringify(res.result.error)}`)
  }
}
