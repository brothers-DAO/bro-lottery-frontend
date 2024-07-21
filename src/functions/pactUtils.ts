import type { ChainId, IUnsignedCommand } from '@kadena/types'
import { network, chain, nameSpace, broAccount, type kadenaToken } from '@/config'
import type { Account, PactValueWithObject } from '@/types/kadena'
import { Pact as PactClient, createClient } from '@kadena/client'
import {Decimal} from 'decimal.js';
import Pact from 'pact-lang-api'
import { Wallets } from '@/stores/wallets'

const CHAINWEB_NODE = import.meta.env.VITE_CHAINWEB_NODE
const NETWORK_ID = network

const creationTime = () => Math.round(new Date().getTime() / 1000)

/* To be sure to have no issues later, we limit to 8 significant digits*/
const to_decimal_cap = x => ({decimal:Decimal(x).toSignificantDigits(8, Decimal.ROUND_UP).toFixed(12)})

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
              `n_582fed11af00dc626812cd7890bb88e72067f28c.bro.TRANSFER`,
              account,
              broAccount,
              to_decimal_cap(amount)
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
  token: kadenaToken,
  account: string,
  amount: number,
  pactCommand: string,
  wallet: Wallets,
  tickets: number
) {
  const salesAccount =
    token.symbol === 'KDA'
      ? await getLocalData(`(${nameSpace}.bro-lottery-helpers.sales-account-in-kda)`)
      : await getLocalData(
          `(${nameSpace}.bro-lottery-helpers.sales-account-in-fungible ${token.contract})`
        )
  const chainId = chain.toString() as ChainId
  const tx =
    wallet === Wallets.EckoWallet
      ? PactClient.builder
          .execution(pactCommand)
          .addSigner(account.slice(1), (signFor) => [
            signFor(`${token.contract}.TRANSFER`, account, salesAccount,to_decimal_cap(amount)),
            signFor(`coin.GAS`)
          ])
          .setMeta({ chainId, gasLimit: 11000, senderAccount: account })
          .setNetworkId(network)
          .createTransaction()
      : createTokenSignRequestV1(pactCommand, amount, account, salesAccount, tickets, token)
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
            to_decimal_cap(amount)
          ],
          name: `n_582fed11af00dc626812cd7890bb88e72067f28c.bro.TRANSFER`
        }
      }
    ],
    data: {},
    nonce: creationTime().toString(),
    chainId: chain.toString(),
    gasPrice: 0.0000001,
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
  broAccount: string,
  tickets: number,
  token: kadenaToken
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
        role: `buy bro with ${token.symbol}`,
        description: `Buy ${tickets} BRO Lottery Tickets`,
        cap: {
          args: [
            account,
            broAccount,
            to_decimal_cap(amount)
          ],
          name: `${token.contract}.TRANSFER`
        }
      }
    ],
    nonce: creationTime().toString(),
    chainId: chain.toString(),
    gasPrice: 0.0000001,
    gasLimit: 11000,
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

export async function checkBalanceForGas(address: string) {
  const res = await getLocalData(`(coin.get-balance "${address}")`)
  if (res) {
    const kdaBalance = res.decimal ?? res
    if (kdaBalance < 0.01) {
      alert(
        `Make sure you have enough KDA on Chain 2 to pay for gas! Your current balance is: ${kdaBalance} KDA.`
      )
    }
  } else {
    alert(`Could not find any KDA balance on Chain 2, make sure to have KDA on chain 2 for GAS!.`)
  }
}

export async function getBalanceForToken(token: kadenaToken, address: string) {
  const res = await getLocalData(`(${token.contract}.get-balance "${address}")`)
  const value = typeof res === 'string' ? 0 : res.decimal ?? res
  return value
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
