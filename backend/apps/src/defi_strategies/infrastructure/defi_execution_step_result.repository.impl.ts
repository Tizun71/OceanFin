import { DefiExecutionStepResultRepository } from '../domain/defi_execution_step_result.repository';
import { DefiExecutionStepResult } from '../domain/defi_execution_step_result.entity';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiExecutionStepResultRepositoryImpl
  implements DefiExecutionStepResultRepository
{
  constructor(private readonly supabaseService: SupabaseService) {}

  async save(
    stepResult: DefiExecutionStepResult,
  ): Promise<DefiExecutionStepResult> {
    const { error, data } = await this.supabaseService
      .getClient()
      .from('defi_execution_step_results')
      .upsert({
        id: stepResult.id,
        execution_id: stepResult.execution_id,
        step_index: stepResult.step_index,
        parachain_id: stepResult.parachain_id,
        pallet: stepResult.pallet,
        call: stepResult.call,
        status: stepResult.status,
        output_assets: stepResult.output_assets,
        error_message: stepResult.error_message,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create DefiExecutionStepResult: ${error.message}`,
      );
    }

    return new DefiExecutionStepResult(
      data.id,
      data.execution_id,
      data.step_index,
      data.parachain_id,
      data.pallet,
      data.call,
      data.status,
      data.output_assets,
      data.error_message,
    );
  }
}
