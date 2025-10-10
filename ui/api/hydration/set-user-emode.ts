import { AAVE_HYDRATION_MAINNET } from "@/utils/addresses";
import { PolkadotEvmRpcProvider } from "./external/polkadotEVMProvider";
import { getHydrationSDK } from "./external/sdkClient";
import { Pool } from "@aave/contract-helpers";
import { H160 } from "@galacticcouncil/sdk";

export async function setUserEmode(categoryId: number, userAddress: string) {
    const { api } = await getHydrationSDK();
    const evm = new PolkadotEvmRpcProvider(api);

    const pool = new Pool(evm, {
        POOL: AAVE_HYDRATION_MAINNET.POOL,
    });

    const user = H160.fromAny(userAddress);

    const txBuilder = await pool.setUserEMode({
        user,
        categoryId
    });

    return txBuilder;
}