export interface StrategyToken {
  amount: number
  symbol: string
  assetId: string
}

export interface StrategyStep {
  step: number
  type: string
  agent: string
  tokenIn: StrategyToken
  tokenOut: StrategyToken
}

export interface StrategyWorkflow {
  fee: number
  loops: string
  steps: StrategyStep[]
}

export interface DefiStrategyVersion {
  id: string
  version: number
  created_at: string
  strategy_id: string
  workflow_json: StrategyWorkflow
  workflow_graph: StrategyWorkflow
}

export interface DefiStrategy {
  id: string
  owner_id: string
  name: string
  description: string
  status: string
  is_public: boolean
  chain_context: string
  current_version_id: string
  created_at: string
  defi_strategy_versions: DefiStrategyVersion[]
}