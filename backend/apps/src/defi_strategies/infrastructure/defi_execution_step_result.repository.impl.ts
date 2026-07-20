import { DefiExecutionStepResultRepository } from '../domain/defi_execution_step_result.repository';
import { DefiExecutionStepResult } from '../domain/defi_execution_step_result.entity';
import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../shared/infrastructure/postgres.service';

@Injectable()
export class DefiExecutionStepResultRepositoryImpl
  implements DefiExecutionStepResultRepository
{
  constructor(private readonly db: PostgresService) {}

  async save(stepResult: DefiExecutionStepResult): Promise<DefiExecutionStepResult> {
    const data = await this.db.queryOne(
      `INSERT INTO defi_execution_step_results
         (id, execution_id, step_index, parachain_id, pallet, call, status, output_assets, error_message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         execution_id = EXCLUDED.execution_id, step_index = EXCLUDED.step_index,
         parachain_id = EXCLUDED.parachain_id, pallet = EXCLUDED.pallet, call = EXCLUDED.call,
         status = EXCLUDED.status, output_assets = EXCLUDED.output_assets,
         error_message = EXCLUDED.error_message
       RETURNING *`,
      [
        stepResult.id,
        stepResult.execution_id,
        stepResult.step_index,
        stepResult.parachain_id,
        stepResult.pallet,
        stepResult.call,
        stepResult.status,
        // jsonb: stringify (may be an array) so it isn't read as a Postgres array.
        stepResult.output_assets == null ? null : JSON.stringify(stepResult.output_assets),
        stepResult.error_message,
      ],
    );

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
