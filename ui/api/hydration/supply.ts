import { H160 } from "@galacticcouncil/sdk";
import { getCorrectPoolBundle, getPoolData } from "./external/pool";
import { ASSET_ID, ASSET_SYMBOL } from "@/utils/constant";
import { parseUnits } from "ethers/lib/utils";
import { getHydrationSDK } from "./external/sdkClient";
import { getGasPrice } from "./get-gas-price";
import { LPSupplyParamsType } from "@aave/contract-helpers/dist/esm/v3-pool-contract/lendingPoolTypes";

export async function supply(
  assetSupply: string,
  amountSupply: string,
  userAddress: string,
) {
  const { api, sdk } = await getHydrationSDK();

  if (assetSupply === ASSET_ID.VDOT) {
    const poolReverse = await getPoolData(ASSET_SYMBOL.VDOT);
    if (!poolReverse) {
      throw new Error(`Pool reverse for address ${assetSupply} not found`);
    }

    const builtTx = await buildSupplyTx(
      {
        amount: parseUnits(amountSupply, poolReverse.decimals).toString(),
        reserve: poolReverse.underlyingAsset,
        onBehalfOf: H160.fromAny(userAddress),
        referralCode: "0",
      },
      userAddress
    );

    const gasPrice = await getGasPrice();

    const evmTx = api.tx.evm.call(
      H160.fromAny(userAddress), // source
      builtTx.to as string, // target
      builtTx.data as string, // input
      '0', // value
      Number(builtTx.gasLimit), // gas_limit
      gasPrice, // max_fee_per_gas
      gasPrice, // max_priority_fee_per_gas
      null, // nonce
      [] // access_list
    );

    return evmTx;
  }

  throw new Error(`Supply ${assetSupply} not supported`);
}

// --- INTERNAL HELPER ---
async function buildSupplyTx(
  args: Omit<LPSupplyParamsType, "user">,
  userAddress: string
) {
  const poolBundle = await getCorrectPoolBundle();
  return poolBundle.supplyTxBuilder.generateTxData({
    ...args,
    user: userAddress,
    useOptimizedPath: true,
  });
}