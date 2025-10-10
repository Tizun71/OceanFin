import { H160 } from "@galacticcouncil/sdk";
import { getCorrectPoolBundle, getPoolData } from "./external/pool";
import { LPBorrowParamsType } from "@aave/contract-helpers/dist/esm/lendingPool-contract/lendingPoolTypes";
import { ASSET_ID, ASSET_SYMBOL } from "@/utils/constant";
import { parseUnits } from "ethers/lib/utils"
import { InterestRate } from "@aave/contract-helpers";

export async function borrow(assetBorrow: string, amountBorrow: string, userAddress: string) {
    if (assetBorrow === ASSET_ID.DOT) {
        const poolReverse = await getPoolData(ASSET_SYMBOL.DOT);
        if (!poolReverse) {
            throw new Error(`Pool reverse for address ${assetBorrow} not found`);
        }

        let borrowTx = await buildBorrowTx({
            amount: parseUnits(amountBorrow, poolReverse.decimals).toString(),
            reserve: poolReverse.underlyingAsset,
            interestRateMode: InterestRate.Variable,
            debtTokenAddress: poolReverse.variableDebtTokenAddress,
        }, userAddress);

        return borrowTx;
    }

    throw new Error(`Borrow ${assetBorrow} not supported`);
}

// --- INTERNAL HELPER ---
async function buildBorrowTx(args: Omit<LPBorrowParamsType, "user">, userAddress: string) {
    const poolBundle = await getCorrectPoolBundle();
    return poolBundle.borrowTxBuilder.generateTxData({
        ...args,
        user: userAddress,
        useOptimizedPath: true,
        onBehalfOf: H160.fromAny(userAddress),
    });
}
