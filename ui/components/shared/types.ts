export type ExecutionStatus = "pending" | "processing" | "completed" | "failed"

export interface ExecutionStep {
  id: string
  title: string
  description: string
  status: ExecutionStatus
  txHash?: string
  fromToken?: {
    icon: string
    symbol: string
  }
  fromAmount?: string
  toToken?: {
    icon: string
    symbol: string
  }
  toAmount?: string
}