import { Injectable } from '@nestjs/common';
import { DefiExecutionStepResultRepository } from '../domain/defi_execution_step_result.repository';
import { CreateExecutionStepResultDto } from '../interfaces/dto/create_execution_step_result.dto';
import { DefiExecutionStepResult } from '../domain/defi_execution_step_result.entity';
import { v4 as uuidv4 } from 'uuid';
import { PostgresService } from '../../shared/infrastructure/postgres.service';

@Injectable()
export class DefiExecutionStepResultService {
  constructor(
    private readonly defiExecutionStepResultRepository: DefiExecutionStepResultRepository,
    private readonly db: PostgresService,
  ) {}

  async getNextStepIndex(executionId: string): Promise<number> {
    const row = await this.db.queryOne<{ step_index: number }>(
      `SELECT step_index FROM defi_execution_step_results
       WHERE execution_id = $1 ORDER BY step_index DESC LIMIT 1`,
      [executionId],
    );

    if (!row) {
      return 0;
    }

    return row.step_index + 1;
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
