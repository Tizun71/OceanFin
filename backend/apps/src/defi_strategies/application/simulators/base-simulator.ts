import {
  ActionSimulator,
  SimulationContext,
  SimulationStepResult,
} from '../../domain/simulation-engine.interface';

export abstract class BaseSimulator implements ActionSimulator {
  abstract simulate(
    step: any,
    context: SimulationContext,
  ): Promise<SimulationStepResult>;

  protected calculateFee(amount: number, feePercentage: number): number {
    return amount * (feePercentage / 100);
  }

  protected calculateSlippage(
    amount: number,
    slippagePercentage: number,
  ): number {
    return amount * (slippagePercentage / 100);
  }

  protected addWarning(context: SimulationContext, warning: string): void {
    if (!context.warnings.includes(warning)) {
      context.warnings.push(warning);
    }
  }
}
