import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../shared/infrastructure/postgres.service';
import { DefiStrategySimulationSnapshot } from '../domain/defi_strategy_simulation_snapshot.entity';
import { DefiStrategySimulationSnapshotRepository } from '../domain/defi_strategy_simulation_snapshot.repository';

@Injectable()
export class DefiStrategySimulationSnapshotRepositoryImpl
  implements DefiStrategySimulationSnapshotRepository
{
  constructor(private readonly db: PostgresService) {}

  // Serialize bigint fields to strings for JSON responses.
  private toDto(d: any) {
    return {
      id: d.id,
      strategy_version_id: d.strategy_version_id,
      snapshot_type: d.snapshot_type,
      estimated_outputs: d.estimated_outputs,
      estimated_weight: (d.estimated_weight ?? 0).toString(),
      estimated_fee: (d.estimated_fee ?? 0).toString(),
      chain_state_ref: d.chain_state_ref,
      created_at: new Date(d.created_at),
    };
  }

  async save(snapshot: DefiStrategySimulationSnapshot) {
    const data = await this.db.queryOne(
      `INSERT INTO defi_strategy_simulation_snapshots
         (id, strategy_version_id, snapshot_type, estimated_outputs, estimated_weight, estimated_fee, chain_state_ref, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8, now()))
       ON CONFLICT (id) DO UPDATE SET
         strategy_version_id = EXCLUDED.strategy_version_id, snapshot_type = EXCLUDED.snapshot_type,
         estimated_outputs = EXCLUDED.estimated_outputs, estimated_weight = EXCLUDED.estimated_weight,
         estimated_fee = EXCLUDED.estimated_fee, chain_state_ref = EXCLUDED.chain_state_ref
       RETURNING *`,
      [
        snapshot.id,
        snapshot.strategy_version_id,
        snapshot.snapshot_type,
        snapshot.estimated_outputs == null ? null : JSON.stringify(snapshot.estimated_outputs),
        Number(snapshot.estimated_weight ?? 0),
        Number(snapshot.estimated_fee ?? 0),
        snapshot.chain_state_ref,
        snapshot.created_at ?? null,
      ],
    );
    return this.toDto(data);
  }

  async getByStrategyVersion(strategy_version_id: string) {
    const rows = await this.db.query(
      `SELECT * FROM defi_strategy_simulation_snapshots
       WHERE strategy_version_id = $1 ORDER BY created_at DESC`,
      [strategy_version_id],
    );
    return rows.map((r) => this.toDto(r));
  }

  async getById(id: string) {
    const row = await this.db.queryOne(
      'SELECT * FROM defi_strategy_simulation_snapshots WHERE id = $1',
      [id],
    );
    return row ? this.toDto(row) : null;
  }
}
