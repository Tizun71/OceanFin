import { ASSET_ID, SLIPPAGE_TOLERANCE } from "@/utils/constant";
import { getHydrationSDK } from "./external/sdkClient";

export async function swap(assetIn: string, assetOut: string, amountIn: string, userAddress: string) {
  const { api, sdk } = await getHydrationSDK();
    const bestRoute = await sdk.api.router.getBestSell(
      ASSET_ID.DOT,
      ASSET_ID.GDOT,
      amountIn
    )

    const builtTx = await sdk.tx
      .trade(bestRoute)
      .withSlippage(SLIPPAGE_TOLERANCE)
      .withBeneficiary(userAddress)
      .build()

    const swapTx = api.tx(builtTx.hex)

    return swapTx;
}