import { H160 } from "@galacticcouncil/sdk";
import { getHydrationSDK } from "./external/sdkClient";

export async function bindEvmAccount() {
    const { api } = await getHydrationSDK();

    return api.tx.evmAccounts.bindEvmAddress();
}