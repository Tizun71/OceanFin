import { UiPoolDataProvider } from "@aave/contract-helpers"
import { initializeHydrationSDK } from "./utils/initialize-hydration-sdk";
import { PolkadotEvmRpcProvider } from "./utils/polkadotEVMProvider";

const POOL_DATA_PROVIDER = "0x112b087b60C1a166130d59266363C45F8aa99db0";
const POOL = "0xf3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691";

export const getSpecificPoolData = async (symbol: string) => {
  try {
    const { api, sdk } = await initializeHydrationSDK()

    const uiPoolDataProvider = new UiPoolDataProvider({
      uiPoolDataProviderAddress: POOL_DATA_PROVIDER,
      provider: new PolkadotEvmRpcProvider(api),
      chainId: 222222,
    })

    const poolData = await uiPoolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: POOL,
    })

    await api.disconnect()
    const specificPoolData = poolData.reservesData.find((pool) => pool.symbol === symbol)
    return specificPoolData

  } catch (error) {
    console.error("Error getting pool data:", error.message)
    throw error
  }
}

export const getSpecificPool = async (poolId: string) => {
  const { api, sdk } = await initializeHydrationSDK();
  const pools = await sdk.api.router.getPools();
  const pool = pools.find((p) => p.id === poolId);
  return pool;
}