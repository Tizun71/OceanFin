import { ASSET_ID, SLIPPAGE_TOLERANCE } from "@/utils/constant";
import { getHydrationSDK } from "./external/sdkClient";
import { EvmClient, PoolService, TradeRouter } from "@galacticcouncil/sdk";
import { parseUnits } from "ethers/lib/utils";

export async function swap(assetIn: string, assetOut: string, amountIn: string, userAddress: string) {
  const { api, sdk } = await getHydrationSDK();
  const evmClient = new EvmClient(api);
  const poolService = new PoolService(api, evmClient);
  const tradeRouter = new TradeRouter(poolService);

  // if (assetIn === ASSET_ID.DOT && assetOut === ASSET_ID.GDOT) {
    const bestRoute = await sdk.api.router.getBestSell(
      assetIn.toString(),
      assetOut.toString(),
      amountIn
    )
    console.log("Best route:", bestRoute);

    const builtTx = await sdk.tx
      .trade(bestRoute)
      .withSlippage(SLIPPAGE_TOLERANCE)
      .withBeneficiary(userAddress)
      .build()

    const swapTx = api.tx(builtTx.hex)

    return swapTx;
  // }
//   else {
//     const route = [
//   { pool: { Aave: null },        assetIn: 5,    assetOut: 1001 },
//   { pool: { Omnipool: null },    assetIn: 1001, assetOut: 222  },
//   { pool: { Stableswap: 110 },   assetIn: 222,  assetOut: 1003 },
//   { pool: { Aave: null },        assetIn: 1003, assetOut: 22   },
// ];
//     const assetDetails = await api.query.assetRegistry.assets(assetIn);
//     const asset = assetDetails.toJSON();
//     const parseAmountIn = parseUnits(amountIn, asset.decimals).toString();
//     try {
//     const builtTx = await sdk.tx
//       .trade(route as any)
//       .withSlippage(SLIPPAGE_TOLERANCE)
//       .withBeneficiary(userAddress)
//       .build()

//     const swapTx = api.tx(builtTx.hex)

//     return swapTx;
//     }
//     catch (error) {
//       console.error("Error fetching best sell route:", error);
//       throw error;
//     }
//   }
}