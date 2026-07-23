/**
 * Aave V4 reserve data (api.v4.aave.com).
 *
 * V4 rates are not a single per-reserve slot like v3: the Liquidity Hub pools
 * the asset across spokes and each user carries a risk premium on top. The
 * official API is the authoritative view of the resulting supply/borrow APY and
 * of the spoke-level collateral factor, so estimates read it instead of
 * re-deriving hub maths. Execution stays fully on-chain (ui/lib/evm/aave-v4.ts).
 */

const AAVE_V4_API = 'https://api.v4.aave.com/graphql';

/** Reserve lists move rarely; rates move per block. 60s keeps estimates fresh. */
const CACHE_TTL_MS = 60_000;

const RESERVES_QUERY = `query Reserves($chainIds: [Int!]!) {
  reserves(request: { query: { chainIds: $chainIds } }) {
    onChainId
    canBorrow
    canSupply
    canUseAsCollateral
    spoke { name address }
    asset { underlying { address } }
    summary { supplyApy { value } borrowApy { value } }
    settings { collateralFactor { value } }
    status { frozen paused }
  }
}`;

/**
 * Builder module protocol column -> Avalanche spoke address. Mirrors
 * `aaveV4.spokes` in ui/config/chains/chain-registry.ts (keep in sync).
 */
export const AAVE_V4_AVALANCHE_SPOKES: Record<string, string> = {
  AAVE_V4_MAIN: '0x435272CefF93a1E657E8ABfdf0A13e95900A3a56',
  AAVE_V4_AVAX_CORRELATED: '0x3b517594277c67307CF2d7CBE6FE1D4399B68c41',
  AAVE_V4_FOREX: '0x6a37776B5E026dBdF043b4F933c323C84DD1B514',
};

export const isAaveV4Protocol = (protocol?: string): boolean =>
  !!protocol && protocol.toUpperCase() in AAVE_V4_AVALANCHE_SPOKES;

/** Spoke address for a builder protocol value, or throw. */
export function requireAaveV4Spoke(protocol: string): string {
  const spoke = AAVE_V4_AVALANCHE_SPOKES[protocol.toUpperCase()];
  if (!spoke) throw new Error(`Unknown Aave v4 spoke protocol: ${protocol}`);
  return spoke;
}

export interface AaveV4ReserveInfo {
  reserveId: number;
  spokeName: string;
  spokeAddress: string;
  /** Lowercased underlying token address. */
  underlying: string;
  /** Fractions (0.0229 = 2.29%), matching the v3 readers. */
  supplyApy: number;
  borrowApy: number;
  collateralFactor: number;
  canSupply: boolean;
  canBorrow: boolean;
  canUseAsCollateral: boolean;
}

interface CacheEntry {
  at: number;
  reserves: Promise<AaveV4ReserveInfo[]>;
}

const cache = new Map<number, CacheEntry>();

async function fetchReserves(chainId: number): Promise<AaveV4ReserveInfo[]> {
  const res = await fetch(AAVE_V4_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: RESERVES_QUERY,
      variables: { chainIds: [chainId] },
    }),
  });

  if (!res.ok) {
    throw new Error(`Aave v4 API returned ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as {
    data?: { reserves?: unknown[] };
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    throw new Error(`Aave v4 API error: ${body.errors[0].message}`);
  }

  const rows = (body.data?.reserves ?? []) as any[];
  return rows
    .filter((r) => !r.status?.frozen && !r.status?.paused)
    .map((r) => ({
      reserveId: Number(r.onChainId),
      spokeName: String(r.spoke.name),
      spokeAddress: String(r.spoke.address).toLowerCase(),
      underlying: String(r.asset.underlying.address).toLowerCase(),
      supplyApy: Number(r.summary.supplyApy.value),
      borrowApy: Number(r.summary.borrowApy.value),
      collateralFactor: Number(r.settings.collateralFactor.value),
      canSupply: !!r.canSupply,
      canBorrow: !!r.canBorrow,
      canUseAsCollateral: !!r.canUseAsCollateral,
    }));
}

/** All v4 reserves on a chain (cached for CACHE_TTL_MS). */
export function getAaveV4Reserves(chainId: number): Promise<AaveV4ReserveInfo[]> {
  const hit = cache.get(chainId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.reserves;

  const reserves = fetchReserves(chainId).catch((err) => {
    // Never cache a failure — the next estimate should retry.
    cache.delete(chainId);
    throw err;
  });
  cache.set(chainId, { at: Date.now(), reserves });
  return reserves;
}

/** One reserve, by spoke address + underlying token. Throws when unlisted. */
export async function getAaveV4Reserve(
  chainId: number,
  spokeAddress: string,
  underlying: string,
): Promise<AaveV4ReserveInfo> {
  const reserves = await getAaveV4Reserves(chainId);
  const match = reserves.find(
    (r) =>
      r.spokeAddress === spokeAddress.toLowerCase() &&
      r.underlying === underlying.toLowerCase(),
  );
  if (!match) {
    throw new Error(
      `Aave v4 spoke ${spokeAddress} has no active reserve for ${underlying}`,
    );
  }
  return match;
}
