import { Injectable } from '@nestjs/common';
import { DefiPairsRepository } from '../domain/defi_pairs.repository';
import { DefiPair } from '../domain/defi_pairs.entity';
import { PostgresService } from '../../shared/infrastructure/postgres.service';

@Injectable()
export class DefiPairsRepositoryImpl implements DefiPairsRepository {
  constructor(private readonly db: PostgresService) {}

  private toEntity(r: any): DefiPair {
    return new DefiPair(r.id, r.action_id, r.token_in_id, r.token_out_id);
  }

  public async save(defiPair: DefiPair): Promise<DefiPair> {
    const row = await this.db.queryOne(
      `INSERT INTO defi_pairs (id, action_id, token_in_id, token_out_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         action_id = EXCLUDED.action_id,
         token_in_id = EXCLUDED.token_in_id,
         token_out_id = EXCLUDED.token_out_id
       RETURNING *`,
      [defiPair.id, defiPair.action_id, defiPair.token_in_id, defiPair.token_out_id],
    );
    return this.toEntity(row);
  }

  public async findAll(): Promise<DefiPair[]> {
    const rows = await this.db.query('SELECT * FROM defi_pairs');
    return rows.map((r) => this.toEntity(r));
  }

  public async findByActionId(actionId: string): Promise<DefiPair[]> {
    const rows = await this.db.query('SELECT * FROM defi_pairs WHERE action_id = $1', [actionId]);
    return rows.map((r) => this.toEntity(r));
  }

  public async findByTokenInId(tokenInId: string): Promise<DefiPair[]> {
    const rows = await this.db.query('SELECT * FROM defi_pairs WHERE token_in_id = $1', [tokenInId]);
    return rows.map((r) => this.toEntity(r));
  }

  public async findByTokenOutId(tokenOutId: string): Promise<DefiPair[]> {
    const rows = await this.db.query('SELECT * FROM defi_pairs WHERE token_out_id = $1', [tokenOutId]);
    return rows.map((r) => this.toEntity(r));
  }

  public async findByTokenPair(tokenInId: string, tokenOutId: string): Promise<DefiPair[]> {
    const rows = await this.db.query(
      'SELECT * FROM defi_pairs WHERE token_in_id = $1 AND token_out_id = $2',
      [tokenInId, tokenOutId],
    );
    return rows.map((r) => this.toEntity(r));
  }
}
