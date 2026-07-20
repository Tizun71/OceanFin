import { Injectable } from "@nestjs/common";
import { PostgresService } from "../../shared/infrastructure/postgres.service";
import { DefiStrategyExecution } from "../domain/defi_strategy_execution.entity";
import { DefiStrategyExecutionRepository } from "../domain/defi_strategy_execution.repository";
import { DefiExecutionStepResult } from "../domain/defi_execution_step_result.entity";

@Injectable()
export class DefiStrategyExecutionRepositoryImpl implements DefiStrategyExecutionRepository {
  constructor(private readonly db: PostgresService) {}

  private toEntity(d: any): DefiStrategyExecution {
    return new DefiStrategyExecution(
      d.id,
      d.strategy_version_id,
      d.extrinsic_hash,
      d.execution_status,
      new Date(d.executed_at),
    );
  }

  async save(execution: DefiStrategyExecution) {
    const row = await this.db.queryOne(
      `INSERT INTO defi_strategy_executions
         (id, strategy_version_id, extrinsic_hash, execution_status, executed_at)
       VALUES ($1, $2, $3, $4, COALESCE($5, now()))
       ON CONFLICT (id) DO UPDATE SET
         strategy_version_id = EXCLUDED.strategy_version_id,
         extrinsic_hash = EXCLUDED.extrinsic_hash,
         execution_status = EXCLUDED.execution_status
       RETURNING *`,
      [
        execution.id,
        execution.strategy_version_id,
        execution.extrinsic_hash,
        execution.execution_status,
        execution.executed_at ?? null,
      ],
    );
    return this.toEntity(row);
  }

  async getByStrategyVersion(strategy_version_id: string): Promise<
    (DefiStrategyExecution & {
      defi_execution_step_results: DefiExecutionStepResult[];
    })[]
  > {
    const sql = `
      SELECT e.*,
        COALESCE((
          SELECT jsonb_agg(to_jsonb(r.*))
          FROM defi_execution_step_results r WHERE r.execution_id = e.id
        ), '[]'::jsonb) AS defi_execution_step_results
      FROM defi_strategy_executions e
      WHERE e.strategy_version_id = $1
      ORDER BY e.executed_at DESC`;
    return (await this.db.query(sql, [strategy_version_id])) as any;
  }

  async update(id: string, updates: Partial<DefiStrategyExecution>) {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (updates.extrinsic_hash !== undefined) {
      params.push(updates.extrinsic_hash);
      sets.push(`extrinsic_hash = $${params.length}`);
    }
    if (updates.execution_status !== undefined) {
      params.push(updates.execution_status);
      sets.push(`execution_status = $${params.length}`);
    }
    if (sets.length === 0) {
      const row = await this.db.queryOne('SELECT * FROM defi_strategy_executions WHERE id = $1', [id]);
      return this.toEntity(row);
    }
    params.push(id);
    const row = await this.db.queryOne(
      `UPDATE defi_strategy_executions SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params,
    );
    return this.toEntity(row);
  }
}
