import type { Address, PublicClient } from "viem";
import { AAVE_V4_SPOKE_ABI } from "./aave-v4-abis";
import type { EvmStepPlan } from "./aave-v3";
import type { AaveV4SpokeKey, ChainMeta } from "@/config/chains/chain-registry";

/**
 * Aave V4 (Hub & Spoke) execution helpers.
 *
 * Unlike v3 — where a call carries the asset address — v4 addresses a position
 * by `reserveId`, a per-spoke index assigned when governance adds the reserve.
 * The id is therefore resolved live from the spoke (getReserveCount/getReserve)
 * and never hardcoded, the same rule the e-mode category id follows on v3.
 */

/** Builder module protocol column -> spoke. One module per spoke. */
export const AAVE_V4_PROTOCOL_SPOKE: Record<string, AaveV4SpokeKey> = {
  AAVE_V4_MAIN: "MAIN",
  AAVE_V4_AVAX_CORRELATED: "AVAX_CORRELATED",
  AAVE_V4_FOREX: "FOREX",
};

export const isAaveV4Protocol = (protocol?: string): boolean =>
  !!protocol && protocol in AAVE_V4_PROTOCOL_SPOKE;

export interface AaveV4Reserve {
  spoke: Address;
  reserveId: bigint;
  underlying: Address;
  decimals: number;
  /** Collateral factor in basis points (0 = cannot be used as collateral). */
  collateralFactorBps: number;
  borrowable: boolean;
  frozen: boolean;
  paused: boolean;
}

/** Resolve the spoke address for a step's protocol, or throw. */
export function requireAaveV4Spoke(chain: ChainMeta, protocol: string): Address {
  const spokes = chain.protocols.aaveV4?.spokes;
  if (!spokes) throw new Error(`Aave v4 not configured for chain ${chain.slug}`);
  const key = AAVE_V4_PROTOCOL_SPOKE[protocol];
  if (!key) throw new Error(`Unknown Aave v4 spoke protocol: ${protocol}`);
  return spokes[key].address;
}

// Reserve lists change only on governance action, so cache per spoke for the
// lifetime of the page rather than re-scanning before every step.
const reserveCache = new Map<string, Promise<AaveV4Reserve[]>>();

async function loadSpokeReserves(
  publicClient: PublicClient,
  spoke: Address,
): Promise<AaveV4Reserve[]> {
  const count = (await publicClient.readContract({
    address: spoke,
    abi: AAVE_V4_SPOKE_ABI,
    functionName: "getReserveCount",
  })) as bigint;

  const ids = Array.from({ length: Number(count) }, (_, i) => BigInt(i));

  return Promise.all(
    ids.map(async (reserveId) => {
      const [reserve, config] = await Promise.all([
        publicClient.readContract({
          address: spoke,
          abi: AAVE_V4_SPOKE_ABI,
          functionName: "getReserve",
          args: [reserveId],
        }),
        publicClient.readContract({
          address: spoke,
          abi: AAVE_V4_SPOKE_ABI,
          functionName: "getReserveConfig",
          args: [reserveId],
        }),
      ]);

      const dynamic = await publicClient.readContract({
        address: spoke,
        abi: AAVE_V4_SPOKE_ABI,
        functionName: "getDynamicReserveConfig",
        args: [reserveId, reserve.dynamicConfigKey],
      });

      return {
        spoke,
        reserveId,
        underlying: reserve.underlying as Address,
        decimals: Number(reserve.decimals),
        collateralFactorBps: Number(dynamic.collateralFactor),
        borrowable: config.borrowable,
        frozen: config.frozen,
        paused: config.paused,
      };
    }),
  );
}

/** All reserves listed on a spoke (cached). */
export function getSpokeReserves(
  publicClient: PublicClient,
  chainId: number,
  spoke: Address,
): Promise<AaveV4Reserve[]> {
  const key = `${chainId}:${spoke.toLowerCase()}`;
  let cached = reserveCache.get(key);
  if (!cached) {
    cached = loadSpokeReserves(publicClient, spoke).catch((err) => {
      // Never cache a failed RPC read — the next step should retry.
      reserveCache.delete(key);
      throw err;
    });
    reserveCache.set(key, cached);
  }
  return cached;
}

/** Resolve one reserve by underlying token, or throw if the spoke has none. */
export async function resolveAaveV4Reserve(
  publicClient: PublicClient,
  chainId: number,
  spoke: Address,
  underlying: Address,
): Promise<AaveV4Reserve> {
  const reserves = await getSpokeReserves(publicClient, chainId, spoke);
  const match = reserves.find(
    (r) => r.underlying.toLowerCase() === underlying.toLowerCase(),
  );
  if (!match) {
    throw new Error(`Aave v4 spoke ${spoke} has no reserve for token ${underlying}`);
  }
  if (match.paused || match.frozen) {
    throw new Error(`Aave v4 reserve ${match.reserveId} (${underlying}) is paused or frozen`);
  }
  return match;
}

/**
 * SUPPLY: approve the underlying to the spoke, then supply(reserveId, ...).
 *
 * A v4 supply does not enable collateral by itself, so — when the reserve has a
 * non-zero collateral factor — an idempotent setUsingAsCollateral runs first
 * (verified to succeed on a zero position), mirroring the Benqi enterMarkets
 * pre-call. Reserves with CF 0 skip it: the call would be pointless there.
 */
export function buildAaveV4Supply(params: {
  reserve: AaveV4Reserve;
  amount: bigint;
  user: Address;
}): EvmStepPlan {
  const { reserve, amount, user } = params;
  const plan: EvmStepPlan = {
    approvals: [{ token: reserve.underlying, spender: reserve.spoke, amount }],
    call: {
      address: reserve.spoke,
      abi: AAVE_V4_SPOKE_ABI,
      functionName: "supply",
      args: [reserve.reserveId, amount, user],
    },
  };

  if (reserve.collateralFactorBps > 0) {
    plan.preCalls = [
      {
        address: reserve.spoke,
        abi: AAVE_V4_SPOKE_ABI,
        functionName: "setUsingAsCollateral",
        args: [reserve.reserveId, true, user],
      },
    ];
  }

  return plan;
}

/** BORROW: no approval — debt is drawn against collateral on the same spoke. */
export function buildAaveV4Borrow(params: {
  reserve: AaveV4Reserve;
  amount: bigint;
  user: Address;
}): EvmStepPlan {
  const { reserve, amount, user } = params;
  if (!reserve.borrowable) {
    throw new Error(`Aave v4 reserve ${reserve.reserveId} is not borrowable`);
  }
  return {
    approvals: [],
    call: {
      address: reserve.spoke,
      abi: AAVE_V4_SPOKE_ABI,
      functionName: "borrow",
      args: [reserve.reserveId, amount, user],
    },
  };
}
