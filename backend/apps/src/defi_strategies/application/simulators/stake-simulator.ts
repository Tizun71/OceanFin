import { Injectable } from '@nestjs/common';
import { BaseSimulator } from './base-simulator';
import {
  SimulationContext,
  SimulationStepResult,
} from '../../domain/simulation-engine.interface';

@Injectable()
export class StakeSimulator extends BaseSimulator {
  async simulate(
    step: any,
    context: SimulationContext,
  ): Promise<SimulationStepResult> {
    const inputAmount = context.current_amount;
    
    const fee = 0;
    
    const outputAmount = inputAmount;
    
    const apy = await this.getStakingAPY(step.agent);
    
    context.current_amount = outputAmount;

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
      apy,
      execution_time: '~1 minute',
    };
  }

  private async getStakingAPY(agent: string): Promise<number> {
    const apyMap: Record<string, number> = {
      HYDRATION: 12.5,
      AAVE: 8.3,
      COMPOUND: 6.7,
    };
    return apyMap[agent] || 10.0;
  }
}
