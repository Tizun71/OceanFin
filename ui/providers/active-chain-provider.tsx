"use client";

import React, { createContext, ReactNode, useCallback, useMemo, useState } from "react";
import {
  ChainMeta,
  ChainSlug,
  DEFAULT_CHAIN_SLUG,
  getChainBySlug,
} from "@/config/chains/chain-registry";

export interface ActiveChainContextValue {
  activeChain: ChainMeta;
  setActiveChain: (slug: ChainSlug) => void;
  isEvm: boolean;
}

export const ActiveChainContext = createContext<ActiveChainContextValue | null>(null);

/**
 * Global active-chain state. Drives which wallet rail, token list, and node
 * palette are shown. Defaults to the first selectable chain (Polkadot is
 * temporarily disabled — see POLKADOT_ENABLED in chain-registry).
 */
export function ActiveChainProvider({
  children,
  defaultSlug = DEFAULT_CHAIN_SLUG,
}: {
  children: ReactNode;
  defaultSlug?: ChainSlug;
}) {
  const [slug, setSlug] = useState<ChainSlug>(defaultSlug);

  const setActiveChain = useCallback((next: ChainSlug) => setSlug(next), []);

  const value = useMemo<ActiveChainContextValue>(() => {
    const activeChain = getChainBySlug(slug);
    return {
      activeChain,
      setActiveChain,
      isEvm: activeChain.kind === "evm",
    };
  }, [slug, setActiveChain]);

  return (
    <ActiveChainContext.Provider value={value}>{children}</ActiveChainContext.Provider>
  );
}
