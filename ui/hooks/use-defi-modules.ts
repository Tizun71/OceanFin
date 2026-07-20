"use client"

import { useQuery } from "@tanstack/react-query"
import { getDefiModules } from "@/services/defi-module-service"
import { mapModuleFromBE } from "@/utils/defi-mapper"
import { Module } from "@/types/defi"

/**
 * Fetch DeFi modules, optionally scoped to a chain slug so the builder palette
 * follows the active chain. Omitting `chain` returns all (backwards compatible).
 */
export const useDefiModules = (chain?: string) => {
  return useQuery<Module[]>({
    queryKey: ["defi-modules", chain ?? "all"],
    queryFn: async () => {
      const data = await getDefiModules(chain)
      return mapModuleFromBE(data)
    },
  })
}
