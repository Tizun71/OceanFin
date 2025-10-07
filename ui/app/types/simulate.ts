export interface Token {
  assetId: string
  symbol: string
  amount?: number
}

export interface Step {
  step: number
  type: string
  agent?: string
  tokenIn?: Token
  tokenOut?: Token
}

export interface SimulateResult {
  initialCapital: Token
  loops: number
  fee: number
  totalSupply: number
  totalBorrow: number
  steps: Step[]
}
