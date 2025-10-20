// src/lib/clients.ts
import { ApiPromise, WsProvider } from '@polkadot/api'
import { ethers } from 'ethers'
import { CHAIN_TYPE, ChainConfig } from './chain'

const substrateCache: Record<string, ApiPromise> = {}

export async function getClient(chain: ChainConfig) {
  if (chain.type === CHAIN_TYPE.SUBSTRATE) {
    if (substrateCache[chain.id]) return substrateCache[chain.id]
    const provider = new WsProvider(chain.rpc)
    const api = await ApiPromise.create({ provider })
    substrateCache[chain.id] = api
    return api
  }

  if (chain.type === CHAIN_TYPE.EVM) {
    return new ethers.providers.JsonRpcProvider(chain.rpc)
  }

  throw new Error('Unsupported chain type')
}
