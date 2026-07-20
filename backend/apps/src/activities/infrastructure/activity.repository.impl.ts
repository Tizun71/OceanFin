import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../domain/activity.repository';
import { Activity, ActivityStatus } from '../domain/activity.entity';
import { PostgresService } from 'src/shared/infrastructure/postgres.service';

@Injectable()
export class ActivityRepositoryImplement implements ActivityRepository {
  constructor(private readonly db: PostgresService) {}

  async findAll(): Promise<Activity[]> {
    const rows = await this.db.query(
      'SELECT * FROM activities ORDER BY created_at DESC',
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByFilter(filters: {
    strategyId?: string;
    userAddress?: string;
  }): Promise<Activity[]> {
    try {
      const where: string[] = [];
      const params: unknown[] = [];
      if (filters.strategyId) {
        params.push(filters.strategyId);
        where.push(`strategy_id = $${params.length}`);
      }
      if (filters.userAddress) {
        params.push(filters.userAddress);
        where.push(`user_address = $${params.length}`);
      }
      const sql =
        `SELECT * FROM activities` +
        (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
        ` ORDER BY created_at DESC`;
      const rows = await this.db.query(sql, params);
      return rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`Error fetching activities with filters: ${JSON.stringify(filters)}`, msg);
      return [];
    }
  }

  async findById(id: string): Promise<Activity | null> {
    try {
      const row = await this.db.queryOne('SELECT * FROM activities WHERE id = $1', [id]);
      return row ? this.mapRowToEntity(row) : null;
    } catch (error) {
      console.warn(`Error fetching activity by id: ${id}`, error);
      return null;
    }
  }

  async findPaginated({
    strategyId,
    userAddress,
    offset,
    limit,
  }: {
    strategyId?: string;
    userAddress?: string;
    offset: number;
    limit: number;
  }): Promise<{ data: Activity[]; total: number }> {
    try {
      const where: string[] = [];
      const params: unknown[] = [];
      if (strategyId) {
        params.push(strategyId);
        where.push(`strategy_id = $${params.length}`);
      }
      if (userAddress) {
        params.push(userAddress);
        where.push(`user_address = $${params.length}`);
      }
      const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';

      const countRow = await this.db.queryOne<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM activities${whereSql}`,
        params,
      );
      const total = countRow ? Number(countRow.count) : 0;

      const limitIdx = params.length + 1;
      const offsetIdx = params.length + 2;
      const rows = await this.db.query(
        `SELECT * FROM activities${whereSql} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        [...params, limit, offset],
      );

      return { data: rows.map((row) => this.mapRowToEntity(row)), total };
    } catch {
      return { data: [], total: 0 };
    }
  }

  async save(activity: Activity): Promise<void> {
    await this.db.query(
      `INSERT INTO activities
         (id, user_address, strategy_id, tx_hash, status, metadata, current_step, total_steps, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, now()))
       ON CONFLICT (id) DO UPDATE SET
         user_address = EXCLUDED.user_address,
         strategy_id = EXCLUDED.strategy_id,
         tx_hash = EXCLUDED.tx_hash,
         status = EXCLUDED.status,
         metadata = EXCLUDED.metadata,
         current_step = EXCLUDED.current_step,
         total_steps = EXCLUDED.total_steps`,
      [
        activity.id,
        activity.userAddress,
        activity.strategyId,
        activity.txHash ?? [],
        activity.status,
        activity.metadata == null ? null : JSON.stringify(activity.metadata),
        activity.currentStep ?? null,
        activity.totalSteps ?? null,
        activity.createdAt ?? null,
      ],
    );
  }

  private mapRowToEntity(row: any): Activity {
    return new Activity(
      row.id,
      row.user_address,
      row.strategy_id,
      row.tx_hash ?? [],
      row.status as ActivityStatus,
      row.metadata || undefined,
      row.current_step || undefined,
      row.total_steps || undefined,
      row.created_at ? new Date(row.created_at) : undefined,
    );
  }
}
