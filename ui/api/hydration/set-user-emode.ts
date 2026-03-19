import { AAVE_HYDRATION_MAINNET } from "@/utils/addresses";
import { PolkadotEvmRpcProvider } from "./external/polkadotEVMProvider";
import { getHydrationSDK } from "./external/sdkClient";
import { Pool } from "@aave/contract-helpers";
import { H160 } from "@galacticcouncil/sdk";
import { getGasPrice } from "./get-gas-price";

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

    const gasPrice = await getGasPrice();

    const evmTx = api.tx.evm.call(
        H160.fromAny(userAddress),        // source
        builtTx.to as string,             // target
        builtTx.data as string,           // input
        '0x0',                            // value 
        1200000,                          // gas_limit
        gasPrice,                         // max_fee_per_gas
        gasPrice,                         // max_priority_fee_per_gas
        null,                             // nonce (Option<U256>)
        [],                               // access_list Vec<(H160, Vec<H256>)>
        []                                // authorization_list Vec<EthereumTransactionEip7702AuthorizationListItem>
    )

    return evmTx;
}