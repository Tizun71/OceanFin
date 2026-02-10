import { DefiExecutionStepResult } from './defi_execution_step_result.entity';

export abstract class DefiExecutionStepResultRepository {
  abstract save(
    stepResult: DefiExecutionStepResult,
  ): Promise<DefiExecutionStepResult>;
}
