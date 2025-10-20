export enum CHAIN_TYPE {
  SUBSTRATE = 'substrate',
  EVM = 'evm',
}

export interface ChainConfig {
  id: string
  name: string
  rpc: string
  type: CHAIN_TYPE
}

export const CHAINS: ChainConfig[] = [
  {
    id: 'hydration-substrate',
    name: 'Hydration (Substrate)',
    rpc: 'wss://hydradx-rpc.play.hydration.cloud',
    type: CHAIN_TYPE.SUBSTRATE,
  },
  {
    id: 'hydration-evm',
    name: 'Hydration EVM',
    rpc: 'https://rpc.evm.hydration.cloud',
    type: CHAIN_TYPE.EVM,
  },
]
