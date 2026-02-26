import { Injectable } from '@nestjs/common';
import { DefiExecutionStepResultRepository } from '../domain/defi_execution_step_result.repository';
import { CreateExecutionStepResultDto } from '../interfaces/dto/create_execution_step_result.dto';
import { DefiExecutionStepResult } from '../domain/defi_execution_step_result.entity';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiExecutionStepResultService {
  constructor(
    private readonly defiExecutionStepResultRepository: DefiExecutionStepResultRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getNextStepIndex(executionId: string): Promise<number> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('defi_execution_step_results')
      .select('step_index')
      .eq('execution_id', executionId)
      .order('step_index', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch latest step index: ${error.message}`);
    }

    if (!data) {
      return 0;
    }

    return data.step_index + 1;
  }

  async createExecStepResult(data: CreateExecutionStepResultDto) {
    const stepIndex = await this.getNextStepIndex(data.execution_id);

    const stepResult = new DefiExecutionStepResult(
      uuidv4(),
      data.execution_id,
      stepIndex,
      data.parachain_id,
      data.pallet,
      data.call,
      data.status,
      data.output_assets,
      data.error_message,
    );

    return this.defiExecutionStepResultRepository.save(stepResult);
  }
}
