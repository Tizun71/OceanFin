import { Injectable } from '@nestjs/common';
import { HydrationSdkService } from '../../shared/infrastructure/hydration-sdk.service';

@Injectable()
export class HydrationStrategyService {
  constructor(private readonly hydrationSdk: HydrationSdkService) {}

  async getAssetPrice(assetInId: string, assetOutId: string): Promise<number> {
    if (!assetInId || !assetOutId) throw new Error('assetInId and assetOutId are required');
    const { sdk } = await this.hydrationSdk.getApiAndSdk();
    const data = await sdk.api.router.getBestSpotPrice(assetInId, assetOutId);
    if (!data || !data.amount || data.decimals === undefined) {
      throw new Error(`Failed to get asset price for ${assetInId} to ${assetOutId}`);
    }
    const raw = data.amount.toString();
    return Number(raw) / 10 ** data.decimals;
  }

  async getMaxLTV(): Promise<number> {
    return 0.9;
  }

  async getMaxBorrow(assetBorrowId: string, amount: number): Promise<number> {
    const maxLTV = await this.getMaxLTV();
    return Number((amount * maxLTV).toFixed(3));
  }
}
