export class ActivityResponseDto {
  id: string;
  userAddress: string;
  strategyId: string;
  txHash: string[];
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  metadata?: Record<string, any>;
  currentStep?: number;
  totalSteps?: number;
  createdAt?: Date;
}

