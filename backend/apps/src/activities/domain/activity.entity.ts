export type ActivityStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export class Activity {
  constructor(
    public readonly id: string,
    public userAddress: string,
    public strategyId: string,
    public txHash: string[],
    public status: ActivityStatus = 'PENDING',
    public metadata?: Record<string, any>,
    public currentStep?: number,
    public totalSteps?: number,
    public createdAt?: Date,
  ) {}
}

