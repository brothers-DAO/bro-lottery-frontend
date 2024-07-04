import type { PactValue } from '@kadena/types'

export type Account = `k:${string}` | `w:${string}` | `r:${string}`

export type SigningCommand = {
  code: string
  data: object
  caps: Array<Capability>
  nonce: string
  chainId: string
  gasLimit: number
  ttl: number
  sender: string
  extraSigners?: Array<string>
}

export type Capability = {
  role: string
  description: string
  cap: {
    name: string
    args: Array<string>
  }
}

export type QuickSignCommand = {
  cmdSigDatas: Array<QuickSignBody>
}

export type QuickSignBody = {
  sigs: Array<QuickSignSigners>
  cmd: string
}

export type QuickSignSigners = {
  pubKey: String
  sig: String | null
}

// Remove this when PactValue is fixed
export type PactValueWithObject = PactValue | object

export type NetworkId = 'mainnet01' | 'testnet04' | 'fast-development'