import { Address } from 'viem';
import { getEvmPublicClient } from './evm-public-client.factory';
import { COMPTROLLER_ABI, QI_TOKEN_ABI, STAKED_AVAX_ABI } from './benqi.abi';

const MANTISSA = 1e18;
const SECONDS_PER_YEAR = 31_536_000;

/** Compound rate-per-second (1e18) → APY with per-second compounding. */
function ratePerSecondToApy(ratePerSecond: bigint): number {
  const r = Number(ratePerSecond) / MANTISSA;
  return (1 + r) ** SECONDS_PER_YEAR - 1;
}

/** Collateral factor of a qiToken market, as a fraction (e.g. 0.6). */
export async function getCollateralFactor(
  chainId: number,
  comptroller: Address,
  qiToken: Address,
): Promise<number> {
  const client = getEvmPublicClient(chainId);
  const [, collateralFactorMantissa] = await client.readContract({
    address: comptroller,
    abi: COMPTROLLER_ABI,
    functionName: 'markets',
    args: [qiToken],
  });

  return Number(collateralFactorMantissa) / MANTISSA;
}

export async function getQiTokenApys(
  chainId: number,
  qiToken: Address,
): Promise<{ supplyApy: number; borrowApy: number }> {
  const client = getEvmPublicClient(chainId);
  const [supplyRate, borrowRate] = await Promise.all([
    client.readContract({
      address: qiToken,
      abi: QI_TOKEN_ABI,
      functionName: 'supplyRatePerTimestamp',
    }),
    client.readContract({
      address: qiToken,
      abi: QI_TOKEN_ABI,
      functionName: 'borrowRatePerTimestamp',
    }),
  ]);

  return {
    supplyApy: ratePerSecondToApy(supplyRate),
    borrowApy: ratePerSecondToApy(borrowRate),
  };
}

/**
 * Real sAVAX staking APR, measured from the exchange-rate drift between now and a
 * past block. sAVAX pays no rebase and no Aave supply yield — the entire return is
 * the sAVAX/AVAX rate climbing, so this is the only honest way to price it.
 *
 * Needs an archive-capable RPC for the lookback block; callers should treat a
 * throw as "unknown APR" rather than zero.
 */
export async function getSAvaxStakingApr(
  chainId: number,
  sAvax: Address,
  lookbackDays = 30,
): Promise<number> {
  const client = getEvmPublicClient(chainId);
  const one = 10n ** 18n;

  const rateAt = (blockNumber?: bigint) =>
    client.readContract({
      address: sAvax,
      abi: STAKED_AVAX_ABI,
      functionName: 'getPooledAvaxByShares',
      args: [one],
      ...(blockNumber === undefined ? {} : { blockNumber }),
    });

  // Avalanche C-Chain targets ~2s blocks.
  const head = await client.getBlockNumber();
  const past = head - BigInt(Math.round(lookbackDays * 43_200));

  const [now, then] = await Promise.all([rateAt(), rateAt(past)]);
  if (then === 0n)
    throw new Error('sAVAX exchange rate at lookback block is zero');

  const growth = Number(now) / Number(then) - 1;
  return (growth * 365) / lookbackDays;
}

/** sAVAX shares that staking `avaxAmount` of native AVAX would mint. */
export async function getSharesByAvax(
  chainId: number,
  sAvax: Address,
  avaxAmount: bigint,
): Promise<bigint> {
  const client = getEvmPublicClient(chainId);
  return client.readContract({
    address: sAvax,
    abi: STAKED_AVAX_ABI,
    functionName: 'getSharesByPooledAvax',
    args: [avaxAmount],
  });
}
