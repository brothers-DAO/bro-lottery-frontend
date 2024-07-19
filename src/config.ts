export const network: string = 'mainnet01'
export const nameSpace: string = 'n_e47192edb40ff014ab9c82ae42972d09bbad4316'
export const broAccount: string = 'c:SW1jyng-6fFDJW_sOTN5JV2T-fkn2NZJkZK2c3Sqgv8'
export const chain: number = 2
export interface kadenaToken {
  id: string
  symbol: string
  contract: string
  image: string
}
export const tokenList: Array<kadenaToken> = [
  {
    id: 'Bro',
    symbol: 'BRO',
    contract: 'n_582fed11af00dc626812cd7890bb88e72067f28c.bro',
    image: '/tokens/bro.png'
  },
  {
    id: 'Kadena',
    symbol: 'KDA',
    contract: 'coin',
    image: '/tokens/kda.png'
  },

  {
    id: 'Arkade',
    symbol: 'ARKD',
    contract: 'arkade.token',
    image: '/tokens/arkd.png'
  },
  {
    id: 'Kishu Ken',
    symbol: 'KISHK',
    contract: 'free.kishu-ken',
    image: '/tokens/kishk.png'
  },
  {
    id: 'Kaddex',
    symbol: 'KDX',
    contract: 'kaddex.kdx',
    image: '/tokens/kdx.png'
  },
  {
    id: 'Miners Of Kadenia',
    symbol: 'MOK',
    contract: 'mok.token',
    image: '/tokens/mok.png'
  },
  {
    id: 'Ktoshi',
    symbol: 'KTOSHI',
    contract: 'n_625e9938ae84bdb7d190f14fc283c7a6dfc15d58.ktoshi',
    image: 'tokens/ktoshi.png'
  },


  /* Blacklisted because no pair on Ecko
  {
    id: 'K:Shib',
    symbol: 'KSHIB',
    contract: 'free.SHIB',
    image: '/tokens/kshib.png'
  },
  */
  {
    id: 'Docushield',
    symbol: 'DOC',
    contract: 'free.docu',
    image: '/tokens/doc.png'
  },
  {
    id: 'Kapybara',
    symbol: 'KAPY',
    contract: 'free.kapybara-token',
    image: '/tokens/kapy.png'
  },
  {
    id: 'Crankk',
    symbol: 'CRANKK',
    contract: 'free.crankk01',
    image: '/tokens/crankk.png'
  },
  {
    id: 'KDLaunch',
    symbol: 'KDL',
    contract: 'kdlaunch.token',
    image: '/tokens/kdl.png'
  },
  {
    id: 'KDSwap',
    symbol: 'KDS',
    contract: 'kdlaunch.kdswap-token',
    image: '/tokens/kds.png'
  },
  {
    id: 'Hypercent',
    symbol: 'HYPE',
    contract: 'hypercent.prod-hype-coin',
    image: '/tokens/hype.png'
  },
  {
    id: 'Flux',
    symbol: 'FLUX',
    contract: 'runonflux.flux',
    image: '/tokens/flux.png'
  },
  {
    id: 'Babena',
    symbol: 'BABE',
    contract: 'free.babena',
    image: '/tokens/babe.png'
  },
  {
    id: 'Anedak',
    symbol: 'ADK',
    contract: 'free.anedak',
    image: '/tokens/adk.png'
  },

  /* Blacklist because 0 liquidity on EckoDEX
  {
    id: 'Wizards Arena',
    symbol: 'WIZA',
    contract: 'free.wiza',
    image: '/tokens/wiza.png'
  },
  */
  /* Blacklisted because no pair on Ecko
  {
    id: 'Kapepe',
    symbol: 'KPP',
    contract: 'n_5a7ccd559b245b7dcbd5259e1ee43d04fbf93eab.kapepe',
    image: '/tokens/kpp.png'
  },*/
  {
    id: 'zUSD',
    symbol: 'ZUSD',
    contract: 'n_b742b4e9c600892af545afb408326e82a6c0c6ed.zUSD',
    image: '/tokens/zusd.png'
  },
  {
    id: 'Cyberfly',
    symbol: 'CFLY',
    contract: 'free.cyberfly_token',
    image: '/tokens/cfly.png'
  },
  {
    id: 'Heron',
    symbol: 'HERON',
    contract: 'n_e309f0fa7cf3a13f93a8da5325cdad32790d2070.heron',
    image: 'tokens/heron.png'
  },
  {
    id: 'Maga',
    symbol: 'MAGA',
    contract: 'free.maga',
    image: 'tokens/maga.png'
  }
  /* Blacklist because token is broken
  {
    id: 'Finux',
    symbol: 'FINUX',
    contract: 'free.finux',
    image: 'tokens/finux.png'
  }
  */
]
