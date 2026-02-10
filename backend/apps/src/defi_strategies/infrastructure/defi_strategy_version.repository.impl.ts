import { DefiStrategyVersionRepository } from '../domain/defi_strategy_version.repository';
import { Injectable } from '@nestjs/common';
import { DefiStrategyVersion } from '../domain/defi_strategy_version.entity';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiStrategyVersionRepositoryImpl
  implements DefiStrategyVersionRepository
{
  constructor(private readonly supabase: SupabaseService) {}

  public async save(
    defiStrategyVersion: DefiStrategyVersion,
  ): Promise<DefiStrategyVersion> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_versions')
      .upsert({
        id: defiStrategyVersion.id,
        strategy_id: defiStrategyVersion.strategy_id,
        version: defiStrategyVersion.version,
        workflow_json: defiStrategyVersion.workflow_json,
        workflow_hash: defiStrategyVersion.workflow_hash,
        workflow_graph: defiStrategyVersion.workflow_graph,
        created_at: defiStrategyVersion.created_at,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save DefiStrategyVersion: ${error.message}`);
    }

    return data;
  }

  public async update(
    id: string,
    updates: Partial<DefiStrategyVersion>,
  ): Promise<DefiStrategyVersion> {
    const updateData: Record<string, unknown> = {};

    if (updates.workflow_json !== undefined)
      updateData.workflow_json = updates.workflow_json;
    if (updates.workflow_hash !== undefined)
      updateData.workflow_hash = updates.workflow_hash;
    if (updates.workflow_graph !== undefined)
      updateData.workflow_graph = updates.workflow_graph;

    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_versions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update DefiStrategyVersion: ${error.message}`);
    }

    if (!data) {
      throw new Error(`DefiStrategyVersion with id ${id} not found`);
    }

    return data;
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('defi_strategy_versions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete DefiStrategyVersion: ${error.message}`);
    }
  }

  public async getByStrategyId(
    strategy_id: string,
  ): Promise<DefiStrategyVersion[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_versions')
      .select('*')
      .eq('strategy_id', strategy_id)
      .order('version', { ascending: false });

    if (error) {
      throw new Error(`Failed to get DefiStrategyVersions: ${error.message}`);
    }

    return data;
  }

  public async getById(id: string): Promise<DefiStrategyVersion | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_versions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get DefiStrategyVersion: ${error.message}`);
    }

    if (!data) return null;

    return data;
  }
}
