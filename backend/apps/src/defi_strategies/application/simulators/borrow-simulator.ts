import { Injectable } from '@nestjs/common';
import { BaseSimulator } from './base-simulator';
import {
  SimulationContext,
  SimulationStepResult,
} from '../../domain/simulation-engine.interface';
import { HydrationSdkService } from 'src/shared/infrastructure/hydration-sdk.service';
import { HydrationStrategyService } from 'src/strategies/application/hydration-strategy.service';

@Injectable()
export class BorrowSimulator extends BaseSimulator {
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

    const fee = 0;

    console.log(step);

    const interestRate = this.getInterestRate(step.tokenOut?.assetId);

    const collateralRatio = step.collateralRatio || 0.7;
    const borrowAmount = inputAmount * collateralRatio;

    const exchangeRate = await this.getExchangeRate(
      step.tokenIn.assetId,
      step.tokenOut.assetId,
    );

    if (collateralRatio > 0.8) {
      this.addWarning(
        context,
        `High collateral ratio (${(collateralRatio * 100).toFixed(0)}%) - risk of liquidation`,
      );
    }

    if (interestRate > 10) {
      this.addWarning(
        context,
        `High interest rate (${interestRate.toFixed(2)}%) detected`,
      );
    }

    const outputAmount = (borrowAmount - fee) * exchangeRate;

    context.current_amount = outputAmount;
    context.total_fee += fee;

    return {
      step_index: step.step,
      action_type: step.type,
      agent: step.agent,
      token_in: {
        asset_id: step.tokenIn?.assetId || 'unknown',
        symbol: step.tokenIn?.symbol || 'COLLATERAL',
        amount: inputAmount,
      },
      token_out: {
        asset_id: step.tokenOut?.assetId || 'unknown',
        symbol: step.tokenOut?.symbol || 'BORROWED',
        amount: outputAmount,
      },
      fee,
      slippage: 0, 
      price_impact: 0, 
      apy: interestRate, 
      execution_time: '~15 seconds',
    };
  }

  private getInterestRate(assetId: string): number {
    const rates: Record<string, number> = {
      '1': 5.5,
      '5': 7.2, 
      '0': 3.8, 
    };

    return rates[assetId] || 6.0;
  }

  private async getExchangeRate(
    assetIdIn: string,
    assetIdOut: string,
  ): Promise<number> {
    const exchangeRate = await this.hydrationStrategyService.getAssetPrice(assetIdIn, assetIdOut);
    return exchangeRate;
  }
}
