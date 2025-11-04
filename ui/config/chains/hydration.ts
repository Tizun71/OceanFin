import { defineChain } from '@luno-kit/react/utils'

export const hydration = defineChain({
  genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3', 
  name: 'Hydration',
  nativeCurrency: {
    name: 'HydraDX',
    symbol: 'HDX',
    decimals: 12,
  },
  rpcUrls: {
    webSocket: ['wss://rpc.hydradx.cloud', 'wss://hydration-rpc.dwellir.com'],
    http: ['https://hydration-rpc.dwellir.com'],
  },
  ss58Format: 63, 
  blockExplorers: {
    default: {
      name: 'Hydration Subscan',
      url: 'https://hydration.subscan.io',
    },
    subsquare: {
      name: 'Subsquare',
      url: 'https://hydration.subsquare.io',
    },
  },
  testnet: false,
  chainIconUrl: '/chain-icon/hydration.png', 
})