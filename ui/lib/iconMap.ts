/**
 * Icon lookup for assets, agents (protocols) and chains.
 *
 * Symbols arriving from the API are not canonical: the same underlying asset
 * shows up wrapped (WETH, WAVAX), bridged (USDC.e, BTC.b, WETH.e) or wrapped in
 * a money-market receipt (qiAVAX on Benqi). They all share the underlying
 * asset's logo, so `resolveAssetIcon` strips those decorations before looking
 * the symbol up rather than requiring one map entry per variant.
 */

export const assetIcons: Record<string, string> = {
  DOT: "/icons/assets/dot.svg",
  GDOT: "/icons/assets/gdot.svg",
  VDOT: "/icons/assets/vdot.svg",
  USDC: "/icons/assets/usdc.svg",
  USDT: "/icons/assets/usdt.svg",
  AVAX: "/icons/assets/avax.png",
  SAVAX: "/icons/assets/savax.png",
  ETH: "/icons/assets/eth.png",
  BTC: "/icons/assets/btc.png",
  DAI: "/icons/assets/dai.png",
  LINK: "/icons/assets/link.png",
  MAI: "/icons/assets/mai.png",
  AAVE: "/icons/assets/aave.png",
};

/**
 * Bridge suffixes appended by the issuing bridge — `.e` (Avalanche Bridge),
 * `.b` (BTC.b), `.m`, `.wh` (Wormhole), `.sol`. Purely provenance, same logo.
 */
const BRIDGE_SUFFIX = /\.(E|B|M|WH|SOL|AXL)$/;

/**
 * Canonicalise a token symbol down to the asset whose logo it should use.
 * WETH.e -> WETH -> ETH; BTC.b -> BTC; qiAVAX -> AVAX; sAVAX keeps its own.
 */
export function normalizeAssetSymbol(symbol: string): string {
  let s = String(symbol ?? "").trim().toUpperCase();
  if (!s) return s;

  // Bridged: strip the provenance suffix (may repeat, e.g. hypothetical .e.b).
  while (BRIDGE_SUFFIX.test(s)) s = s.replace(BRIDGE_SUFFIX, "");

  // Direct hit wins before any prefix stripping — sAVAX has its own logo and
  // must never be reduced to AVAX.
  if (assetIcons[s]) return s;

  // Benqi qiToken receipts: qiAVAX, qiUSDC, qiSAVAX.
  if (s.startsWith("QI") && assetIcons[s.slice(2)]) return s.slice(2);

  // Aave aToken receipts: aUSDC, aWETH (guarded so AAVE stays itself).
  if (s !== "AAVE" && s.startsWith("A") && assetIcons[s.slice(1)]) return s.slice(1);

  // Wrapped natives: WETH, WAVAX, WBTC, WDOT.
  if (s.startsWith("W") && assetIcons[s.slice(1)]) return s.slice(1);

  return s;
}

/** Icon path for a token symbol, or undefined so the caller can fall back. */
export function resolveAssetIcon(symbol?: string | null): string | undefined {
  if (!symbol) return undefined;
  return assetIcons[normalizeAssetSymbol(symbol)];
}

export const agentIcons: Record<string, string> = {
  AAVE: "/icons/agents/aave.png",
  UNISWAP: "/icons/agents/uniswap.png",
  BENQI: "/icons/agents/benqi.png",
  TRADERJOE: "/icons/agents/trader-joe.png",
  HYDRATION: "/chain-icon/hydration.png",
};

/**
 * Agent names reach the UI in several shapes — "Aave v3", "Trader Joe (LFJ)",
 * "Benqi (sAVAX looping)", "HYDRATION". Reduce to letters only and match on a
 * prefix so version/qualifier tails do not need their own entries.
 */
export function resolveAgentIcon(agent?: string | null): string | undefined {
  const key = String(agent ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  if (!key) return undefined;
  if (agentIcons[key]) return agentIcons[key];
  if (key.includes("LFJ") || key.includes("JOE")) return agentIcons.TRADERJOE;
  const match = Object.keys(agentIcons).find((k) => key.startsWith(k));
  return match ? agentIcons[match] : undefined;
}

/** Keyed by chain slug; display names are aliased onto the same paths. */
export const chainIcons: Record<string, string> = {
  POLKADOT: "/chain-icon/hydration.png",
  HYDRATION: "/chain-icon/hydration.png",
  AVALANCHE: "/icons/chains/avax.png",
  AVAX: "/icons/chains/avax.png",
  BASE: "/chain-icon/base.png",
  ARBITRUM: "/chain-icon/arbitrum.png",
};

export function resolveChainIcon(chain?: string | null): string | undefined {
  const key = String(chain ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  if (!key) return undefined;
  if (chainIcons[key]) return chainIcons[key];
  const match = Object.keys(chainIcons).find((k) => key.startsWith(k));
  return match ? chainIcons[match] : undefined;
}
