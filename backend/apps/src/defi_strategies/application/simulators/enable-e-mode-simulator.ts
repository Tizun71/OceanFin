import { Injectable } from '@nestjs/common';
import { BaseSimulator } from './base-simulator';
import {
  SimulationContext,
  SimulationStepResult,
} from '../../domain/simulation-engine.interface';

@Injectable()
export class EnableEModeSimulator extends BaseSimulator {
  async simulate(
    step: any,
    context: SimulationContext,
  ): Promise<SimulationStepResult> {
    const inputAmount = context.current_amount;

    const feePercentage = 0.01;
    const fee = this.calculateFee(inputAmount, feePercentage);

    const outputAmount = inputAmount - fee;

    context.current_amount = outputAmount;
    context.total_fee += fee;

    this.addWarning(
      context,
      'E-Mode enabled: Higher collateral ratio and lower liquidation risk',
    );

    console.log("E-Mode step simulated:", step);

    return {
      step_index: step.step,
      action_type: step.type,
      agent: step.agent,
      token_in: {
        asset_id: step.tokenIn?.assetId || 'unknown',
        symbol: step.tokenIn?.symbol || 'SAME',
        amount: inputAmount,
      },
      token_out: {
        asset_id: step.tokenOut?.assetId || step.tokenIn?.assetId || 'unknown',
        symbol: step.tokenOut?.symbol || step.tokenIn?.symbol || 'SAME',
        amount: outputAmount,
      },
      fee,
      slippage: 0,
      price_impact: 0,
      execution_time: '~10 seconds',
    };
  }
}
