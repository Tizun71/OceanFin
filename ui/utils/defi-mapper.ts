import { ModuleFromBE, Module } from "@/types/defi"

export const mapModuleFromBE = (
  data: ModuleFromBE[]
): Module[] => {
  return data.map((m) => ({
    id: m.id,
    name: m.name,
    protocol: m.protocol,
    category: m.category,
    parachain_id: m.parachain_id,
    icon_url: m.icon_url,
    description: m.description,
    website_url: m.website_url,
    is_active: m.is_active,
    created_at: m.created_at,
    actions: m.defi_module_actions ?? [],
  }))
}
