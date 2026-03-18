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
  operation_type: DefiOperationType;
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

export type DefiOperationType =
  | "JOIN_STRATEGY"
  | "SWAP"
  | "SUPPLY"
  | "BORROW";

export interface BaseEstimateResponse {
  operation_type: DefiOperationType;
  token_in_id?: string;
  token_out_id?: string;
  amount_in?: number;
  amount_out?: number;
}

export interface SwapEstimateResponse extends BaseEstimateResponse {
  operation_type: "SWAP";
  token_in_id: string;
  token_out_id: string;
  amount_in: number;
  amount_out: number;
  slippage: number;
}

export interface JoinStrategyEstimateResponse extends BaseEstimateResponse {
  operation_type: "JOIN_STRATEGY";
  token_in_id: string;
  token_out_id: string;
  amount_in: number;
  amount_out: number;
  slippage: number;
  supply_apy: number;
}

export interface SupplyEstimateResponse extends BaseEstimateResponse {
  operation_type: "SUPPLY";
  token_in_id: string;
  amount_in: number;
  supply_apy: number;
}

export interface BorrowEstimateResponse extends BaseEstimateResponse {
  operation_type: "BORROW";
  token_in_id: string;
  token_out_id: string;
  amount_in: number;
  amount_out: number;
  borrow_apy: number;
  ltv: number;
}

export type DefiEstimateResponse =
  | SwapEstimateResponse
  | JoinStrategyEstimateResponse
  | SupplyEstimateResponse
  | BorrowEstimateResponse;