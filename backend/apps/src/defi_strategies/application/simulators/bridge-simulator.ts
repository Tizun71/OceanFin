import { Injectable } from '@nestjs/common';
import { BaseSimulator } from './base-simulator';
import {
  SimulationContext,
  SimulationStepResult,
} from '../../domain/simulation-engine.interface';

@Injectable()
export class BridgeSimulator extends BaseSimulator {
  async simulate(
    step: any,
    context: SimulationContext,
  ): Promise<SimulationStepResult> {
    const inputAmount = context.current_amount;
    
    const feePercentage = 0.1;
    const fee = this.calculateFee(inputAmount, feePercentage);
    
    const outputAmount = inputAmount - fee;
    
    context.current_amount = outputAmount;
    context.total_fee += fee;

    return {
      step_index: step.step,
      action_type: step.type,
      agent: step.agent,
      token_in: {
        asset_id: step.tokenIn.assetId,
        symbol: step.tokenIn.symbol,
        amount: inputAmount,
      },
      token_out: {
        asset_id: step.tokenOut.assetId,
        symbol: step.tokenOut.symbol,
        amount: outputAmount,
      },
      fee,
      execution_time: '~2 minutes',
    };
  }
}
