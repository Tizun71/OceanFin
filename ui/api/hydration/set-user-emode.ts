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

    const txs = await pool.setUserEMode({
        user,
        categoryId
    });

    const builtTx = txs[0] as any;

    const evmTx = api.tx.evm.call(
        H160.fromAny(userAddress),
        builtTx.to as string,
        builtTx.data as string,
        '0',
        1200000,
        3080573,
        3080573,
        null,
        []
    )

    console.log("Built setUserEmode evmTx:", evmTx);

    return evmTx;
}