import { DefiExecutionStepResult } from './defi_execution_step_result.entity';
import { DefiStrategyExecution } from './defi_strategy_execution.entity';

export abstract class DefiStrategyExecutionRepository {
  abstract save(
    execution: DefiStrategyExecution,
  ): Promise<DefiStrategyExecution>;
  abstract getByStrategyVersion(strategy_version_id: string): Promise<
    (DefiStrategyExecution & {
      defi_execution_step_results: DefiExecutionStepResult[];
    })[]
  >;
  abstract update(
    id: string,
    updates: Partial<DefiStrategyExecution>,
  ): Promise<DefiStrategyExecution>;
}
