import { Address } from 'viem';
import { getEvmPublicClient } from './evm-public-client.factory';
import { AAVE_V3_POOL_ABI, RAY, SECONDS_PER_YEAR } from './aave-v3.abi';

export interface AaveReserveApys {
  supplyApy: number;
  variableBorrowApy: number;
}

export interface AaveUserAccount {
  /** Health factor as a float (1e18-scaled on-chain). Infinity if no debt. */
  healthFactor: number;
  /** Loan-to-value in percent. */
  ltv: number;
  totalCollateralBase: bigint;
  totalDebtBase: bigint;
}

/** Aave rate (ray, per-year APR) → APY with per-second compounding. */
function rayRateToApy(ratePerYearRay: bigint): number {
  const apr = Number(ratePerYearRay) / Number(RAY);
  return (1 + apr / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1;
}

export async function getReserveApys(
  chainId: number,
  pool: Address,
  asset: Address,
): Promise<AaveReserveApys> {
  const client = getEvmPublicClient(chainId);
  const data: any = await client.readContract({
    address: pool,
    abi: AAVE_V3_POOL_ABI,
    functionName: 'getReserveData',
    args: [asset],
  });

  return {
    supplyApy: rayRateToApy(data.currentLiquidityRate as bigint),
    variableBorrowApy: rayRateToApy(data.currentVariableBorrowRate as bigint),
  };
}

export interface AaveReserveInfo extends AaveReserveApys {
  /** Loan-to-value as a fraction (e.g. 0.75). */
  ltv: number;
  /** Liquidation threshold as a fraction. */
  liquidationThreshold: number;
}

/**
 * Reserve rates plus risk params in one getReserveData call. LTV and liquidation
 * threshold are packed into the reserve `configuration` bitmask (Aave v3):
 * bits 0-15 = LTV, bits 16-31 = liquidation threshold, both in basis points.
 */
export async function getReserveInfo(
  chainId: number,
  pool: Address,
  asset: Address,
): Promise<AaveReserveInfo> {
  const client = getEvmPublicClient(chainId);
  const data: any = await client.readContract({
    address: pool,
    abi: AAVE_V3_POOL_ABI,
    functionName: 'getReserveData',
    args: [asset],
  });

  const config = BigInt(data.configuration as bigint);
  return {
    supplyApy: rayRateToApy(data.currentLiquidityRate as bigint),
    variableBorrowApy: rayRateToApy(data.currentVariableBorrowRate as bigint),
    ltv: Number(config & 0xffffn) / 10000,
    liquidationThreshold: Number((config >> 16n) & 0xffffn) / 10000,
  };
}

export async function getUserAccountData(
  chainId: number,
  pool: Address,
  user: Address,
): Promise<AaveUserAccount> {
  const client = getEvmPublicClient(chainId);
  const [totalCollateralBase, totalDebtBase, , , ltv, healthFactor] =
    (await client.readContract({
      address: pool,
      abi: AAVE_V3_POOL_ABI,
      functionName: 'getUserAccountData',
      args: [user],
    })) as readonly bigint[];

  // Aave returns type(uint256).max for HF when there is no debt.
  const hfRaw = healthFactor;
  const isMax = hfRaw > 10n ** 30n;

  return {
    healthFactor: isMax ? Infinity : Number(hfRaw) / 1e18,
    ltv: Number(ltv) / 100,
    totalCollateralBase,
    totalDebtBase,
  };
}
