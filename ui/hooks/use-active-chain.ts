"use client";

import { useContext } from "react";
import {
  ActiveChainContext,
  ActiveChainContextValue,
} from "@/providers/active-chain-provider";

export function useActiveChain(): ActiveChainContextValue {
  const ctx = useContext(ActiveChainContext);
  if (!ctx) {
    throw new Error("useActiveChain must be used within an ActiveChainProvider");
  }
  return ctx;
}
