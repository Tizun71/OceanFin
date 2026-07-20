import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResultRow } from 'pg';

/**
 * Thin node-postgres wrapper. Replaces the Supabase SDK with a direct Postgres
 * connection (DATABASE_URL). Repositories build parameterized SQL and map rows
 * to domain entities themselves — matching the existing DDD style.
 */
@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const connectionString = this.configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment');
    }

    const ssl =
      this.configService.get<string>('DATABASE_SSL') === 'true'
        ? { rejectUnauthorized: false }
        : undefined;

    this.pool = new Pool({ connectionString, ssl, max: 10 });
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  /** Run a parameterized query and return all rows. */
  async query<T extends QueryResultRow = any>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }

  /** Return the first row or null. */
  async queryOne<T extends QueryResultRow = any>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  /** Run work inside a transaction. */
  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const out = await fn(client);
      await client.query('COMMIT');
      return out;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
