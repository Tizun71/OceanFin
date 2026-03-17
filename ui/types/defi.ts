export interface Token {
  id: string
  name: string
  asset_id: number
}

export interface DefiPair {
  id: string
  token_in: Token
  token_out: Token
}

export interface Action {
  id: string
  name: string
  operation_type: "JOIN STRATEGY" | "SWAP" | "SUPPLY" | "BORROW";
  call: string
  pallet: string
  is_active: boolean
  module_id: string
  created_at: string
  defi_pairs: DefiPair[]
  risk_level: string
  description: string
  param_schema: Record<string, any>
}

export interface Module {
  id: string
  name: string
  protocol: string
  category: string
  parachain_id: number
  icon_url: string
  description: string
  website_url: string
  is_active: boolean
  created_at: string
  actions: Action[]
}

export interface ModuleFromBE {
  id: string
  name: string
  protocol: string
  category: string
  parachain_id: number
  icon_url: string
  description: string
  website_url: string
  is_active: boolean
  created_at: string
  defi_module_actions: Action[]
}
export interface CreateStrategyPayload{
  nodeId:string
  moduleId:string
  actionId:string
  tokenInId:string
  tokenOutId:string
  tokenInSymbol:string
  tokenOutSymbol:string
  amount:number
  amountOut:number
  slippage:number
}
export interface CreateStrategyRequest {
  owner_id: string
  name: string
  description: string
  is_public: boolean
  chain_context: string
  status: string
  workflow_json: any
  workflow_graph: any
}