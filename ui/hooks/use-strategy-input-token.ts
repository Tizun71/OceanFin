"use client";

import { useMemo } from "react";
import { useActiveChain } from "@/hooks/use-active-chain";
import { useDefiTokens } from "@/hooks/use-defi-tokens";
import {
  resolveStrategyInputToken,
  type StrategyInputToken,
} from "@/lib/strategy-input-token";

export interface UseStrategyInputTokenResult extends StrategyInputToken {
  /** Registry still loading — callers should not treat "unresolved" as final yet. */
  isLoading: boolean;
}

/**
 * Chain-aware input token for a strategy: substrate resolves to a Hydration
 * asset id, EVM resolves to an ERC-20 address + decimals from the registry.
 */
export function useStrategyInputToken(strategy: any): UseStrategyInputTokenResult {
  const { activeChain, isEvm } = useActiveChain();
  // Substrate ids come from constants, so only EVM needs the registry.
  const { data: tokens, isLoading } = useDefiTokens(isEvm ? activeChain.slug : undefined);

  const token = useMemo(
    () => resolveStrategyInputToken(strategy, tokens, activeChain),
    [strategy, tokens, activeChain],
  );

  return { ...token, isLoading: isEvm && isLoading };
}
