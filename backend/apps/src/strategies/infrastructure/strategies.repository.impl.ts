import { Injectable } from '@nestjs/common';
import { PostgresService } from 'src/shared/infrastructure/postgres.service';
import { StrategiesRepository } from '../domain/strategies.repository';
import { Strategy } from '../domain/strategies.entity';
import { UUID } from 'crypto';

// Whitelist sortable columns — sortBy is caller-provided, so never interpolate raw.
const SORTABLE = new Set(['apy', 'strategist_name']);

@Injectable()
export class StrategiesRepositoryImplement implements StrategiesRepository {
  constructor(private readonly db: PostgresService) {}

  private mapRowToEntity(row: any): Strategy {
    return new Strategy(
      row.id,
      row.strategist_name,
      // pg returns numeric as a string to avoid float precision loss; the UI does
      // arithmetic on apy (toFixed, sorting), so coerce it back at the boundary.
      row.apy === null || row.apy === undefined ? row.apy : Number(row.apy),
      row.tags ?? [],
      row.strategist_handle ?? undefined,
      row.assets ?? [],
      row.agents ?? [],
      row.chains ?? [],
      row.title ?? undefined,
    );
  }

  private orderClause(sortBy?: string, order: 'asc' | 'desc' = 'desc'): string {
    if (sortBy && SORTABLE.has(sortBy)) {
      return ` ORDER BY ${sortBy} ${order === 'asc' ? 'ASC' : 'DESC'}`;
    }
    return '';
  }

  async findById(id: UUID): Promise<Strategy | null> {
    const row = await this.db.queryOne('SELECT * FROM strategies WHERE id = $1', [id]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findAll(sortBy?: string, order: 'asc' | 'desc' = 'desc', limit?: number): Promise<Strategy[]> {
    const params: unknown[] = [];
    let sql = 'SELECT * FROM strategies' + this.orderClause(sortBy, order);
    if (limit) {
      params.push(limit);
      sql += ` LIMIT $${params.length}`;
    }
    const rows = await this.db.query(sql, params);
    return rows.map((r) => this.mapRowToEntity(r));
  }

  async findAllWithFilters(params: {
    keyword?: string;
    tags?: string[];
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
  }): Promise<{ data: Strategy[]; total: number }> {
    const { keyword, tags, sortBy, order = 'desc', limit } = params;
    const where: string[] = [];
    const args: unknown[] = [];

    if (keyword) {
      args.push(`%${keyword}%`);
      where.push(`(strategist_name ILIKE $${args.length} OR title ILIKE $${args.length})`);
    }
    if (tags && tags.length > 0) {
      args.push(tags);
      where.push(`tags @> $${args.length}::text[]`);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM strategies${whereSql}`,
      args,
    );
    const total = countRow ? Number(countRow.count) : 0;

    let sql = `SELECT * FROM strategies${whereSql}` + this.orderClause(sortBy, order);
    if (limit) {
      args.push(limit);
      sql += ` LIMIT $${args.length}`;
    }
    const rows = await this.db.query(sql, args);

    return { data: rows.map((r) => this.mapRowToEntity(r)), total };
  }

  async save(strategy: Strategy): Promise<void> {
    await this.db.query(
      `INSERT INTO strategies
         (id, strategist_name, strategist_handle, apy, tags, assets, agents, chains, title)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         strategist_name = EXCLUDED.strategist_name,
         title = EXCLUDED.title,
         strategist_handle = EXCLUDED.strategist_handle,
         apy = EXCLUDED.apy,
         tags = EXCLUDED.tags,
         assets = EXCLUDED.assets,
         agents = EXCLUDED.agents,
         chains = EXCLUDED.chains`,
      [
        strategy.id,
        strategy.strategistName,
        strategy.strategistHandle,
        strategy.apy,
        strategy.tags,
        strategy.assets,
        strategy.agents,
        strategy.chains,
        strategy.title ?? null,
      ],
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.db.query('DELETE FROM strategies WHERE id = $1', [id]);
  }
}
