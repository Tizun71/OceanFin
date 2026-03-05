import { Injectable } from '@nestjs/common';
import { BaseSimulator } from './base-simulator';
import {
  SimulationContext,
  SimulationStepResult,
} from '../../domain/simulation-engine.interface';
import { HydrationSdkService } from 'src/shared/infrastructure/hydration-sdk.service';
import { HydrationStrategyService } from 'src/strategies/application/hydration-strategy.service';

@Injectable()
export class JoinStrategySimulator extends BaseSimulator {
    constructor(
      private readonly hydrationSdk: HydrationSdkService,
      private readonly hydrationStrategyService: HydrationStrategyService,
    ) {
      super();
    }
  async simulate(
    step: any,
    context: SimulationContext,
  ): Promise<SimulationStepResult> {
    const inputAmount = context.current_amount;

    const feePercentage = 0.1;
    const fee = this.calculateFee(inputAmount, feePercentage);

    const slippage = this.calculateSlippage(
      inputAmount,
      context.slippage_tolerance,
    );

    const priceImpact = this.calculatePriceImpact(inputAmount);

    if (priceImpact > 1.0) {
      this.addWarning(
        context,
        `High price impact (${priceImpact.toFixed(2)}%) detected in join strategy`,
      );
    }

    const exchangeRate = await this.getExchangeRate(
      step.tokenIn?.assetId,
      step.tokenOut?.assetId,
    );

    const outputAmount = (inputAmount - fee - slippage) * exchangeRate;

    context.current_amount = outputAmount;
    context.total_fee += fee;

    return {
      step_index: step.step,
      action_type: step.type,
      agent: step.agent,
      token_in: {
        asset_id: step.tokenIn?.assetId || 'unknown',
        symbol: step.tokenIn?.symbol || 'UNKNOWN',
        amount: inputAmount,
      },
      token_out: {
        asset_id: step.tokenOut?.assetId || 'unknown',
        symbol: step.tokenOut?.symbol || 'UNKNOWN',
        amount: outputAmount,
      },
      fee,
      slippage: context.slippage_tolerance,
      price_impact: priceImpact,
      execution_time: '~20 seconds',
    };
  }

  private async getExchangeRate(
    assetIdIn: string,
    assetIdOut: string,
  ): Promise<number> {
    const exchangeRate = await this.hydrationStrategyService.getAssetPrice(assetIdIn, assetIdOut);
    return exchangeRate;
  }

  private calculatePriceImpact(amount: number): number {
    if (amount > 10000) return 2.0;
    if (amount > 5000) return 1.0;
    if (amount > 1000) return 0.4;
    return 0.08;
  }
}
