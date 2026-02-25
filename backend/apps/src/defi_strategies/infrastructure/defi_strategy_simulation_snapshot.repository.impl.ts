import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';
import { DefiStrategySimulationSnapshot } from '../domain/defi_strategy_simulation_snapshot.entity';
import { DefiStrategySimulationSnapshotRepository } from '../domain/defi_strategy_simulation_snapshot.repository';

@Injectable()
export class DefiStrategySimulationSnapshotRepositoryImpl
  implements DefiStrategySimulationSnapshotRepository
{
  constructor(private readonly supabase: SupabaseService) {}

  async save(snapshot: DefiStrategySimulationSnapshot) {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_simulation_snapshots')
      .upsert({
        id: snapshot.id,
        strategy_version_id: snapshot.strategy_version_id,
        snapshot_type: snapshot.snapshot_type,
        estimated_outputs: snapshot.estimated_outputs,
        estimated_weight: Number(snapshot.estimated_weight ?? 0),
        estimated_fee: Number(snapshot.estimated_fee ?? 0),
        chain_state_ref: snapshot.chain_state_ref,
        created_at: snapshot.created_at,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save snapshot: ${error.message}`);

    // return plain object with serializable bigint fields represented as strings
    return {
      id: data.id,
      strategy_version_id: data.strategy_version_id,
      snapshot_type: data.snapshot_type,
      estimated_outputs: data.estimated_outputs,
      estimated_weight: (data.estimated_weight ?? 0).toString(),
      estimated_fee: (data.estimated_fee ?? 0).toString(),
      chain_state_ref: data.chain_state_ref,
      created_at: new Date(data.created_at),
    };
  }

  async getByStrategyVersion(strategy_version_id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_simulation_snapshots')
      .select('*')
      .eq('strategy_version_id', strategy_version_id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch snapshots: ${error.message}`);

    return (data || []).map((item: any) => ({
      id: item.id,
      strategy_version_id: item.strategy_version_id,
      snapshot_type: item.snapshot_type,
      estimated_outputs: item.estimated_outputs,
      estimated_weight: (item.estimated_weight ?? 0).toString(),
      estimated_fee: (item.estimated_fee ?? 0).toString(),
      chain_state_ref: item.chain_state_ref,
      created_at: new Date(item.created_at),
    }));
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_simulation_snapshots')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116')
      throw new Error(`Failed to get snapshot: ${error.message}`);
    if (!data) return null;

    return {
      id: data.id,
      strategy_version_id: data.strategy_version_id,
      snapshot_type: data.snapshot_type,
      estimated_outputs: data.estimated_outputs,
      estimated_weight: (data.estimated_weight ?? 0).toString(),
      estimated_fee: (data.estimated_fee ?? 0).toString(),
      chain_state_ref: data.chain_state_ref,
      created_at: new Date(data.created_at),
    };
  }
}
