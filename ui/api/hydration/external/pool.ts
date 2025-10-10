import { AAVE_HYDRATION_MAINNET } from "@/utils/addresses";
import { PolkadotEvmRpcProvider } from "./polkadotEVMProvider";
import { PoolBundle, UiPoolDataProvider } from "@aave/contract-helpers";
import { getHydrationSDK } from "./sdkClient";

export async function getCorrectPoolBundle() {
    const { api, sdk } = await getHydrationSDK();
    const provider = new PolkadotEvmRpcProvider(api);

    const poolBundle = new PoolBundle(provider, {
        POOL: AAVE_HYDRATION_MAINNET.POOL,
        WETH_GATEWAY: AAVE_HYDRATION_MAINNET.WETH_GATEWAY,
    });
    
    return poolBundle;
}

export async function getPoolData(assetSymbol: string) {
    try {
        const { api, sdk } = await getHydrationSDK();

        const uiPoolDataProvider = new UiPoolDataProvider({
            uiPoolDataProviderAddress: AAVE_HYDRATION_MAINNET.UI_POOL_DATA_PROVIDER,
            provider: new PolkadotEvmRpcProvider(api),
            chainId: 222222,
        })

        const poolData = await uiPoolDataProvider.getReservesHumanized({
            lendingPoolAddressProvider: AAVE_HYDRATION_MAINNET.POOL_ADDRESSES_PROVIDER,
        })

        const foundReserve = poolData.reservesData.find((reserve) => reserve.symbol.toLowerCase() === assetSymbol.toLowerCase())
        return foundReserve;

    } catch (error) {
        console.error("Error getting pool data:", error)
        throw error
    }
}