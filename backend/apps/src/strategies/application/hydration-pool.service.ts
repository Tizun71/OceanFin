import { Injectable } from '@nestjs/common'
import { HydrationSdkService } from '../../shared/infrastructure/hydration-sdk.service'
import { UiPoolDataProvider } from '@aave/contract-helpers'
import { PolkadotEvmRpcProvider } from '../infrastructure/helpers/hydration/utils/polkadotEVMProvider'

const POOL_DATA_PROVIDER = '0x112b087b60C1a166130d59266363C45F8aa99db0'
const POOL = '0xf3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691'

@Injectable()
export class HydrationPoolService {
  constructor(private readonly hydrationSdk: HydrationSdkService) {}

  async getPoolDataBySymbol(symbol: string) {
    if (!symbol) throw new Error('symbol is required')
    const { api } = await this.hydrationSdk.getApiAndSdk()
    const provider = new UiPoolDataProvider({
      uiPoolDataProviderAddress: POOL_DATA_PROVIDER,
      provider: new PolkadotEvmRpcProvider(api),
      chainId: 222222,
    })
    const data = await provider.getReservesHumanized({ lendingPoolAddressProvider: POOL })
    const found = data.reservesData.find(r => r.symbol === symbol)
    if (!found) throw new Error('pool not found')
    return found
  }

  async getPoolById(poolId: string) {
    if (!poolId) throw new Error('poolId is required')
    const { sdk } = await this.hydrationSdk.getApiAndSdk()
    const pools = await sdk.api.router.getPools()
    const found = pools.find((p: any) => p.id === poolId)
    if (!found) throw new Error('pool not found')
    return found
  }
}
