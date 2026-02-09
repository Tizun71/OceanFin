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
        created_at: defiStrategyVersion.created_at,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save DefiStrategyVersion: ${error.message}`);
    }

    return new DefiStrategyVersion(
      data.id,
      data.strategy_id,
      data.version,
      data.workflow_json,
      data.workflow_hash,
      new Date(data.created_at),
    );
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

    return new DefiStrategyVersion(
      data.id,
      data.strategy_id,
      data.version,
      data.workflow_json,
      data.workflow_hash,
      new Date(data.created_at),
    );
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

    return (data || []).map(
      (item) =>
        new DefiStrategyVersion(
          item.id,
          item.strategy_id,
          item.version,
          item.workflow_json,
          item.workflow_hash,
          new Date(item.created_at),
        ),
    );
  }
}
