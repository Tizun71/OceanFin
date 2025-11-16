import { BalanceClient } from "@galacticcouncil/sdk";
import { getHydrationSDK } from "./external/sdkClient";
import { formatBalance } from "@luno-kit/core/utils";

export async function getTokenBalance(account: string, id: string) {
    const { api } = await getHydrationSDK();
    const balanceClient = new BalanceClient(api);
    const res = await balanceClient.getTokenBalanceData(account.toString(), id.toString());

    const freeValue = res.get('free');
    const free = freeValue !== undefined ? BigInt(freeValue.toString()) : BigInt(0);
    const freeHuman = formatBalance(free, 10); // DOT
    return freeHuman;
}