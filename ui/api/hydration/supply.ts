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
  console.log(`Preparing supply transaction for ${amountSupply} of asset ${assetSupply} by user ${userAddress}`);
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

    console.log("Built supply transaction:", builtTx);

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

    console.log("Built EVM transaction for vDOT supply:", evmTx);

    return evmTx;
  }
  console.log(assetSupply, ASSET_ID.DOT);
  if (assetSupply.toString() === ASSET_ID.DOT) {
    console.log("Building supply transaction for DOT...");
    const builtTx = await buildSupplyTx(
      {
        amount: parseUnits(amountSupply, 10).toString(),
        reserve: "0x0000000000000000000000000000000100000005",
        onBehalfOf: H160.fromAny(userAddress),
        referralCode: "0",
      },
      userAddress,
    );

    console.log("Built supply transaction:", builtTx);

    const gasPrice = await getGasPrice();

    try {
      const evmTx = api.tx.evm.call(
        H160.fromAny(userAddress), // source
        builtTx.to as string, // target
        builtTx.data as string, // input
        '0', // value
        Number(builtTx.gasLimit), // gas_limit
        gasPrice, // max_fee_per_gas
        gasPrice, // max_priority_fee_per_gas
        null, // nonce
        [], // access_list
        []
      );
      console.log("Built EVM transaction for DOT supply:", evmTx);

      return evmTx;
    }
    catch (error) {
      console.error("Error building EVM transaction for DOT supply:", error);
      throw error;
    }

  }
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