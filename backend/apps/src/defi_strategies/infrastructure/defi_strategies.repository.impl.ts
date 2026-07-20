import { Injectable } from '@nestjs/common';
import { DefiStrategiesRepository } from '../domain/defi_strategies.repository';
import { DefiStrategy } from '../domain/defi_strategies.entity';
import { PostgresService } from '../../shared/infrastructure/postgres.service';
import { DefiStrategyVersion } from '../domain/defi_strategy_version.entity';

const UPDATABLE = ['name', 'description', 'status', 'is_public', 'chain_context', 'current_version_id'];

@Injectable()
export class DefiStrategiesRepositoryImplement implements DefiStrategiesRepository {
  constructor(private readonly db: PostgresService) {}

  public async save(defiStrategy: DefiStrategy): Promise<DefiStrategy> {
    const row = await this.db.queryOne(
      `INSERT INTO defi_strategies
         (id, owner_id, name, description, status, is_public, chain_context, current_version_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9, now()))
       ON CONFLICT (id) DO UPDATE SET
         owner_id = EXCLUDED.owner_id, name = EXCLUDED.name, description = EXCLUDED.description,
         status = EXCLUDED.status, is_public = EXCLUDED.is_public,
         chain_context = EXCLUDED.chain_context, current_version_id = EXCLUDED.current_version_id
       RETURNING *`,
      [
        defiStrategy.id,
        defiStrategy.owner_id,
        defiStrategy.name,
        defiStrategy.description,
        defiStrategy.status,
        defiStrategy.is_public,
        defiStrategy.chain_context,
        defiStrategy.current_version_id,
        defiStrategy.created_at ?? null,
      ],
    );
    return row as DefiStrategy;
  }

  public async getById(id: string): Promise<DefiStrategy | null> {
    const row = await this.db.queryOne('SELECT * FROM defi_strategies WHERE id = $1', [id]);
    return (row as DefiStrategy) ?? null;
  }

  public async getAll(
    owner_id?: string,
  ): Promise<(DefiStrategy & { defi_strategy_versions: DefiStrategyVersion[] })[]> {
    // Nest versions per strategy (mirror the previous PostgREST embed).
    const nested = `
      SELECT s.*,
        COALESCE((
          SELECT jsonb_agg(to_jsonb(v.*))
          FROM defi_strategy_versions v WHERE v.strategy_id = s.id
        ), '[]'::jsonb) AS defi_strategy_versions
      FROM defi_strategies s`;

    const params: unknown[] = [];
    let sql = nested;
    if (owner_id) {
      params.push(owner_id);
      sql += ` WHERE s.owner_id = $${params.length}`;
    } else {
      sql += ` WHERE s.is_public = true`;
    }
    sql += ` ORDER BY s.created_at DESC`;

    return (await this.db.query(sql, params)) as any;
  }

  public async update(id: string, updates: Partial<DefiStrategy>): Promise<DefiStrategy> {
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const col of UPDATABLE) {
      const val = (updates as any)[col];
      if (val !== undefined) {
        params.push(val);
        sets.push(`${col} = $${params.length}`);
      }
    }
    if (sets.length === 0) {
      const current = await this.getById(id);
      if (!current) throw new Error(`DefiStrategy with id ${id} not found`);
      return current;
    }
    params.push(id);
    const row = await this.db.queryOne(
      `UPDATE defi_strategies SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params,
    );
    if (!row) throw new Error(`DefiStrategy with id ${id} not found`);
    return row as DefiStrategy;
  }

  public async delete(id: string): Promise<void> {
    // FK ON DELETE CASCADE removes versions, but delete explicitly for parity.
    await this.db.query('DELETE FROM defi_strategy_versions WHERE strategy_id = $1', [id]);
    await this.db.query('DELETE FROM defi_strategies WHERE id = $1', [id]);
  }
}
