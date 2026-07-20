import { resolveAssetIcon } from "@/lib/iconMap";
import { ASSET_ID } from "@/utils/constant";
import type { DefiTokenDto } from "@/services/defi-token-service";
import type { ChainMeta } from "@/config/chains/chain-registry";

export interface StrategyInputToken {
  /** Display symbol, e.g. "DOT" / "USDC". Empty when the strategy declares none. */
  symbol: string;
  /** Icon path when known; undefined falls back to a letter badge in the UI. */
  icon?: string;
  /** Hydration asset id — substrate balance lookups + simulation. */
  assetId?: string;
  /** ERC-20 address — EVM balance reads + execution. Absent for a native coin. */
  address?: `0x${string}`;
  /** Decimals; needed to format a balance on either EVM path. */
  decimals?: number;
  /**
   * The chain's native coin (AVAX/ETH) rather than an ERC-20. It has no contract,
   * so balances come from getBalance and transfers use msg.value — see
   * lib/evm/staked-avax.ts, where the Benqi loop stakes native AVAX.
   */
  isNative?: boolean;
  /** True once the token carries what its chain needs to be usable. */
  isResolved: boolean;
}

/**
 * Resolve the token a strategy actually takes as input.
 *
 * `GET /strategies/:id` returns `inputAsset`, read from the first step of the
 * strategy's workflow — that is the authoritative answer and already carries
 * address + decimals on EVM.
 *
 * Do NOT fall back to `strategy.assets`: that column holds ICON PATHS
 * ('/icons/assets/usdc.svg'), not symbols. Substrate strategies without an
 * `inputAsset` fall back to the explicit assetId fields.
 */
export function resolveStrategyInputToken(
  strategy: any,
  tokens?: DefiTokenDto[],
  chain?: ChainMeta,
): StrategyInputToken {
  const input = strategy?.inputAsset;
  // Legacy callers may still pass a bare symbol string.
  const declared = typeof input === "string" ? { symbol: input } : input ?? undefined;

  const symbol = String(declared?.symbol ?? "").trim();
  const key = symbol.toUpperCase();
  const icon = resolveAssetIcon(key);

  if (!chain || chain.kind === "substrate") {
    const assetId =
      strategy?.inputAssetId ??
      strategy?.assetIdIn ??
      (ASSET_ID as Record<string, string>)[key];

    const resolvedAssetId =
      assetId === undefined || assetId === null ? undefined : String(assetId);

    return { symbol, icon, assetId: resolvedAssetId, isResolved: !!resolvedAssetId };
  }

  // Native coin (AVAX on Avalanche, ETH on Base/Arbitrum) — no ERC-20 contract.
  if (symbol && key === chain.nativeCurrency.symbol.toUpperCase()) {
    return {
      symbol,
      icon,
      decimals: chain.nativeCurrency.decimals,
      isNative: true,
      isResolved: true,
    };
  }

  // The workflow already carries address + decimals; trust it first.
  let address = declared?.address ? (declared.address as `0x${string}`) : undefined;
  let decimals = declared?.decimals ?? undefined;

  // Otherwise fall back to the chain's token registry, matched by symbol.
  if (!address || decimals === undefined) {
    const match = tokens?.find(
      (t) => t.chain === chain.slug && String(t.name ?? "").trim().toUpperCase() === key,
    );
    address = address ?? (match?.address ? (match.address as `0x${string}`) : undefined);
    decimals = decimals ?? match?.decimals ?? undefined;
  }

  return {
    symbol,
    icon,
    address,
    decimals,
    isNative: false,
    isResolved: !!address && decimals !== undefined,
  };
}
