"use client"

import { useQuery } from "@tanstack/react-query"
import { getDefiModules } from "@/services/defi-module-service"
import { mapModuleFromBE } from "@/utils/defi-mapper"
import { Module } from "@/types/defi"

export const useDefiModules = () => {
  return useQuery<Module[]>({
    queryKey: ["defi-modules"],
    queryFn: async () => {
      const data = await getDefiModules()
      return mapModuleFromBE(data)
    },
  })
}
