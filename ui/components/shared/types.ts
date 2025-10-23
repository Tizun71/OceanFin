export type ExecutionStatus = "pending" | "processing" | "completed" | "failed"

export interface ExecutionStep {
  id: string
  title: string
  description: string
  status: ExecutionStatus
  txHash?: string
}