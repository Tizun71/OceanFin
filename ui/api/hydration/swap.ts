import { ASSET_ID, SLIPPAGE_TOLERANCE } from "@/utils/constant";
import { getHydrationSDK } from "./external/sdkClient";
import { EvmClient, PoolService, TradeRouter } from "@galacticcouncil/sdk";
import { parseUnits } from "ethers/lib/utils";

export async function swap(assetIn: string, assetOut: string, amountIn: string, userAddress: string) {
  const { api, sdk } = await getHydrationSDK();
  const evmClient = new EvmClient(api);
  const poolService = new PoolService(api, evmClient);
  const tradeRouter = new TradeRouter(poolService);

  if (assetIn === ASSET_ID.DOT && assetOut === ASSET_ID.GDOT) {
    const bestRoute = await sdk.api.router.getBestSell(
      assetIn,
      assetOut,
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
  else {
    const assetDetails = await api.query.assetRegistry.assets(assetIn);
    const asset = assetDetails.toJSON();
    console.log("Available pools:", await tradeRouter.getPools());
    if (!asset) {
      throw new Error(`Asset details for ${assetIn} not found`);
    }
    console.log(`Asset details for ${assetIn}:`, asset);
    const parseAmountIn = parseUnits(amountIn, asset.decimals).toString();
    try {
    const trade = await sdk.api.router.getBestSell(assetIn, assetOut, parseAmountIn);
          console.log(trade);
    return trade;
    }
    catch (error) {
      console.error("Error fetching best sell route:", error);
      throw error;
    }
  }
}