import { H160 } from "@galacticcouncil/sdk";
import { getCorrectPoolBundle, getPoolData } from "./external/pool";
import { LPBorrowParamsType } from "@aave/contract-helpers/dist/esm/lendingPool-contract/lendingPoolTypes";
import { ASSET_ID, ASSET_SYMBOL } from "@/utils/constant";
import { parseUnits } from "ethers/lib/utils"
import { InterestRate } from "@aave/contract-helpers";
import { getHydrationSDK } from "./external/sdkClient";
import { getGasPrice } from "./get-gas-price";

export async function borrow(assetBorrow: string, amountBorrow: string, userAddress: string) {
    const { api, sdk } = await getHydrationSDK();
    assetBorrow = assetBorrow.toString();
    if (assetBorrow === ASSET_ID.DOT) {
        console.log('Borrow Dot')
        try {
            const poolReverse = await getPoolData(ASSET_SYMBOL.DOT);
            if (!poolReverse) {
                throw new Error(`Pool reverse for address ${assetBorrow} not found`);
            }

            const builtTx = await buildBorrowTx({
                amount: parseUnits(amountBorrow, poolReverse.decimals).toString(),
                reserve: '0x0000000000000000000000000000000100000005',
                interestRateMode: InterestRate.Variable,
                debtTokenAddress: poolReverse.variableDebtTokenAddress,
            }, userAddress);

            const gasPrice = await getGasPrice();

            const evmTx = api.tx.evm.call(
                H160.fromAny(userAddress),
                builtTx.to as string,
                builtTx.data as string,
                '0',
                Number(builtTx.gasLimit),
                gasPrice,
                gasPrice,
                null,
                [],
                []
            )

            return evmTx;
        }
        catch (error) {
            console.error(`Error building borrow transaction for ${assetBorrow}:`, error);
            throw new Error(`Failed to build borrow transaction for ${assetBorrow}`);
        }
    }

    if (assetBorrow.toString() === ASSET_ID.USDC) {

        const builtTx = await buildBorrowTx({
            amount: parseUnits(amountBorrow, 6).toString(),
            reserve: '0x0000000000000000000000000000000100000016',
            interestRateMode: InterestRate.Variable,
        }, userAddress);

        const gasPrice = await getGasPrice();

        const evmTx = api.tx.evm.call(
            H160.fromAny(userAddress),
            builtTx.to as string,
            builtTx.data as string,
            '0',
            Number(builtTx.gasLimit),
            gasPrice,
            gasPrice,
            null,
            [],
            []
        )

        return evmTx;
    }

    if (assetBorrow.toString() === ASSET_ID.USDT) {

        const builtTx = await buildBorrowTx({
            amount: parseUnits(amountBorrow, 6).toString(),
            reserve: '0x000000000000000000000000000000010000000A',
            interestRateMode: InterestRate.Variable,
        }, userAddress);

        const gasPrice = await getGasPrice();

        const evmTx = api.tx.evm.call(
            H160.fromAny(userAddress),
            builtTx.to as string,
            builtTx.data as string,
            '0',
            Number(builtTx.gasLimit),
            gasPrice,
            gasPrice,
            null,
            [],
            []
        )

        return evmTx;
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
