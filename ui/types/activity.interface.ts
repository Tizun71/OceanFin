export interface CreateActivityPayload {
  userAddress: string;
  strategyId: string;
  initialCapital: string;
  totalSteps: number;
  currentStep: number;
}

export interface UpdateActivityPayload {
  activityId: string
  step: number
  status: 'PENDING' | 'FAILED' | 'SUCCESS'
  message: string
}

export type ActivityFilter = {
  userAddress?: string;
  strategyId?: string;
  page?: number;
  limit?: number;
}

export interface ActivityResponse {
  id?: string
  createdAt?: string
  userAddress?: string
  strategyId?: string
  currentStep?: number
  totalSteps?: number
  metadata?: {
    APR?: string
    fee?: string
    initial_capital?: string | number
  }
  status?: string
  txHash?: string[]
}