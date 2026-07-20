import { DefiStrategyVersionRepository } from "../domain/defi_strategy_version.repository";
import { Injectable } from "@nestjs/common";
import { DefiStrategyVersion } from "../domain/defi_strategy_version.entity";
import { PostgresService } from "../../shared/infrastructure/postgres.service";

const jsonb = (v: unknown) => (v == null ? null : JSON.stringify(v));

@Injectable()
export class DefiStrategyVersionRepositoryImpl implements DefiStrategyVersionRepository {
  constructor(private readonly db: PostgresService) {}

  public async save(v: DefiStrategyVersion): Promise<DefiStrategyVersion> {
    const row = await this.db.queryOne(
      `INSERT INTO defi_strategy_versions
         (id, strategy_id, version, workflow_json, workflow_graph, created_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, now()))
       ON CONFLICT (id) DO UPDATE SET
         strategy_id = EXCLUDED.strategy_id, version = EXCLUDED.version,
         workflow_json = EXCLUDED.workflow_json, workflow_graph = EXCLUDED.workflow_graph
       RETURNING *`,
      [v.id, v.strategy_id, v.version, jsonb(v.workflow_json), jsonb(v.workflow_graph), v.created_at ?? null],
    );
    return row as DefiStrategyVersion;
  }

  public async update(
    id: string,
    updates: Partial<DefiStrategyVersion>,
  ): Promise<DefiStrategyVersion> {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (updates.workflow_json !== undefined) {
      params.push(jsonb(updates.workflow_json));
      sets.push(`workflow_json = $${params.length}`);
    }
    if (updates.workflow_graph !== undefined) {
      params.push(jsonb(updates.workflow_graph));
      sets.push(`workflow_graph = $${params.length}`);
    }
    if (sets.length === 0) {
      const current = await this.getById(id);
      if (!current) throw new Error(`DefiStrategyVersion with id ${id} not found`);
      return current;
    }
    params.push(id);
    const row = await this.db.queryOne(
      `UPDATE defi_strategy_versions SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params,
    );
    if (!row) throw new Error(`DefiStrategyVersion with id ${id} not found`);
    return row as DefiStrategyVersion;
  }

  public async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM defi_strategy_versions WHERE id = $1', [id]);
  }

  public async getByStrategyId(strategy_id: string): Promise<DefiStrategyVersion[]> {
    return (await this.db.query(
      'SELECT * FROM defi_strategy_versions WHERE strategy_id = $1 ORDER BY version DESC',
      [strategy_id],
    )) as DefiStrategyVersion[];
  }

  public async getById(id: string): Promise<DefiStrategyVersion | null> {
    const row = await this.db.queryOne('SELECT * FROM defi_strategy_versions WHERE id = $1', [id]);
    return (row as DefiStrategyVersion) ?? null;
  }
}
