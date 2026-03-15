import { Injectable } from '@nestjs/common';
import { BaseSimulator } from './base-simulator';
import {
  SimulationContext,
  SimulationStepResult,
} from '../../domain/simulation-engine.interface';

@Injectable()
export class SupplySimulator extends BaseSimulator {
  async simulate(
    step: any,
    context: SimulationContext,
  ): Promise<SimulationStepResult> {
    const inputAmount = context.current_amount;

    const feePercentage = 0.02;
    const fee = this.calculateFee(inputAmount, feePercentage);

    const supplyApy = this.getSupplyApy(step.tokenIn?.assetId);

    const outputAmount = inputAmount - fee;

    context.current_amount = outputAmount;
    context.total_fee += fee;

    if (supplyApy < 2) {
      this.addWarning(
        context,
        `Low supply APY (${supplyApy.toFixed(2)}%) detected`,
      );
    }

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
        asset_id: step.tokenOut?.assetId || step.tokenIn?.assetId || 'unknown',
        symbol: step.tokenOut?.symbol || `a${step.tokenIn?.symbol}` || 'aSUPPLIED',
        amount: outputAmount,
      },
      fee,
      slippage: 0, 
      price_impact: 0, 
      apy: supplyApy,
      execution_time: '~12 seconds',
    };
  }

  private getSupplyApy(assetId: string): number {
    const apys: Record<string, number> = {
      '1': 4.5, // DOT
      '5': 6.2, // HDX
      '0': 8.5, // Stablecoin
      '69': 5.8, // GDOT
    };

    return apys[assetId] || 5.0;
  }
}
