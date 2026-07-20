"use client";

import { useQuery } from "@tanstack/react-query";
import { getDefiTokens, type DefiTokenDto } from "@/services/defi-token-service";

/**
 * Token registry for a chain. EVM entries carry address + decimals, which the
 * strategy detail page needs to show the right input token and read its balance.
 */
export const useDefiTokens = (chain?: string) => {
  return useQuery<DefiTokenDto[]>({
    queryKey: ["defi-tokens", chain ?? "all"],
    queryFn: () => getDefiTokens(chain),
    // The registry changes rarely; avoid refetching on every mount.
    staleTime: 5 * 60 * 1000,
  });
};
