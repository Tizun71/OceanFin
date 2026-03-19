import { SLIPPAGE_TOLERANCE } from "@/utils/constant";
import { getHydrationSDK } from "./external/sdkClient";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export async function swap(
  assetIn: string,
  assetOut: string,
  amountIn: string,
  userAddress: string
) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { api, sdk } = await getHydrationSDK();
      await api.isReady;

      const bestRoute = await sdk.api.router.getBestSell(assetIn, assetOut, amountIn);

      if (!bestRoute || bestRoute.swaps?.length === 0) {
        throw new Error(`No route found for ${assetIn} → ${assetOut}`);
      }

      console.log(
        `[Swap] Attempt ${attempt}: route via`,
        bestRoute.swaps?.map((s: any) => s.poolAddress).join(" → ")
      );

      const builtTx = await sdk.tx
        .trade(bestRoute)
        .withSlippage(SLIPPAGE_TOLERANCE)
        .withBeneficiary(userAddress)
        .build();

      const swapTx = api.tx(builtTx.hex);
      return swapTx;

    } catch (err: any) {
      lastError = err;
      const msg = err?.message ?? "";

      const isRetryable =
        msg.includes("WebSocket is not connected") ||
        msg.includes("disconnected") ||
        msg.includes("Priority is too low") ||
        msg.includes("pool") ||
        msg.includes("timeout");

      console.warn(`[Swap] Attempt ${attempt} failed: ${msg}`);

      if (!isRetryable || attempt === MAX_RETRIES) break;

      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS * attempt));
    }
  }

  throw new Error(`[Swap] Failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}