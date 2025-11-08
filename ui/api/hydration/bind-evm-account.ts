import { H160 } from "@galacticcouncil/sdk";
import { getHydrationSDK } from "./external/sdkClient";

export async function bindEvmAccount(substrateAddress: string) {
    const { api } = await getHydrationSDK();
    const evmAddress = H160.fromAny(substrateAddress).toString();

    return api.tx.evmAccounts.bindAccount(evmAddress);
}

export async function checkEvmAccountBound(substrateAddress: string) {
    const { api } = await getHydrationSDK();
    const evmAddress = H160.fromAny(substrateAddress).toString();
    const extension = await api.query.evmAccounts.accountExtension(evmAddress);

    return !!extension.toHuman();
}