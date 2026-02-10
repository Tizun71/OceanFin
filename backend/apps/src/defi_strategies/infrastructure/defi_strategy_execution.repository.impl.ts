import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';
import { DefiStrategyExecution } from '../domain/defi_strategy_execution.entity';
import { DefiStrategyExecutionRepository } from '../domain/defi_strategy_execution.repository';
import { DefiExecutionStepResult } from '../domain/defi_execution_step_result.entity';

@Injectable()
export class DefiStrategyExecutionRepositoryImpl
  implements DefiStrategyExecutionRepository
{
  constructor(private readonly supabase: SupabaseService) {}

  async save(execution: DefiStrategyExecution) {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_executions')
      .upsert({
        id: execution.id,
        strategy_version_id: execution.strategy_version_id,
        extrinsic_hash: execution.extrinsic_hash,
        execution_status: execution.execution_status,
        workflow_hash: execution.workflow_hash,
        executed_at: execution.executed_at,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save execution: ${error.message}`);

    return new DefiStrategyExecution(
      data.id,
      data.strategy_version_id,
      data.extrinsic_hash,
      data.execution_status,
      data.workflow_hash,
      new Date(data.executed_at),
    );
  }

  async getByStrategyVersion(strategy_version_id: string): Promise<
    (DefiStrategyExecution & {
      defi_execution_step_results: DefiExecutionStepResult[];
    })[]
  > {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_executions')
      .select('*, defi_execution_step_results(*)')
      .eq('strategy_version_id', strategy_version_id)
      .order('executed_at', { ascending: false });

    if (error) throw new Error(`Failed to get executions: ${error.message}`);

    return data;
  }

  async update(id: string, updates: Partial<DefiStrategyExecution>) {
    const updateData: Record<string, unknown> = {};
    if (updates.extrinsic_hash !== undefined)
      updateData.extrinsic_hash = updates.extrinsic_hash;
    if (updates.execution_status !== undefined)
      updateData.execution_status = updates.execution_status;
    if (updates.workflow_hash !== undefined)
      updateData.workflow_hash = updates.workflow_hash;

    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_executions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update execution: ${error.message}`);

    return new DefiStrategyExecution(
      data.id,
      data.strategy_version_id,
      data.extrinsic_hash,
      data.execution_status,
      data.workflow_hash,
      new Date(data.executed_at),
    );
  }
}
