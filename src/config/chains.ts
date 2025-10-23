import { Chain } from 'viem'

export const mezoMainnet = {
  id: 1_571,
  name: 'Mezo',
  network: 'mezo',
  nativeCurrency: {
    decimals: 18,
    name: 'MEZO',
    symbol: 'MEZO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mezo.network'],
      webSocket: ['wss://ws.mezo.network'],
    },
    public: {
      http: ['https://rpc.mezo.network'],
      webSocket: ['wss://ws.mezo.network'],
    },
  },
  blockExplorers: {
    default: { name: 'MezoScan', url: 'https://scan.mezo.network' },
  },
  contracts: {
    musd: {
      address: '0x2880aB155794e7179c9eE2e38200202908C17B43',
    },
    pythOracle: {
      address: '0x2880aB155794e7179c9eE2e38200202908C17B43', // From the docs
    },
  },
} as const satisfies Chain

export const mezoTestnet = {
  id: 1_572,
  name: 'Mezo Testnet',
  network: 'mezo-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MEZO',
    symbol: 'MEZO',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.mezo.network'],
      webSocket: ['wss://testnet.ws.mezo.network'],
    },
    public: {
      http: ['https://testnet.rpc.mezo.network'],
      webSocket: ['wss://testnet.ws.mezo.network'],
    },
  },
  blockExplorers: {
    default: { name: 'MezoScan Testnet', url: 'https://testnet.scan.mezo.network' },
  },
  contracts: {
    musd: {
      address: '0x2880aB155794e7179c9eE2e38200202908C17B43',
    },
    pythOracle: {
      address: '0x2880aB155794e7179c9eE2e38200202908C17B43', // From the docs
    },
  },
  testnet: true,
} as const satisfies Chain