import { Injectable } from '@nestjs/common';
import { DefiStrategiesRepository } from '../domain/defi_strategies.repository';
import { DefiStrategy } from '../domain/defi_strategies.entity';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';
import { DefiStrategyVersion } from '../domain/defi_strategy_version.entity';

@Injectable()
export class DefiStrategiesRepositoryImplement
  implements DefiStrategiesRepository
{
  constructor(private readonly supabase: SupabaseService) {}

  public async save(defiStrategy: DefiStrategy): Promise<DefiStrategy> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategies')
      .upsert({
        id: defiStrategy.id,
        owner_id: defiStrategy.owner_id,
        name: defiStrategy.name,
        description: defiStrategy.description,
        status: defiStrategy.status,
        is_public: defiStrategy.is_public,
        chain_context: defiStrategy.chain_context,
        current_version_id: defiStrategy.current_version_id,
        created_at: defiStrategy.created_at,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save DefiStrategy: ${error.message}`);
    }

    return data;
  }

  public async getById(id: string): Promise<DefiStrategy | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  public async getAll(
    owner_id?: string,
  ): Promise<
    (DefiStrategy & { defi_strategy_versions: DefiStrategyVersion[] })[]
  > {
    let query = this.supabase
      .getClient()
      .from('defi_strategies')
      .select('*, defi_strategy_versions(*)');

    if (owner_id) {
      query = query.eq('owner_id', owner_id);
    } else {
      query = query.eq('is_public', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to get DefiStrategies by owner: ${error.message}`,
      );
    }

    return data || [];
  }

  public async update(
    id: string,
    updates: Partial<DefiStrategy>,
  ): Promise<DefiStrategy> {
    const updateData: Record<string, unknown> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.is_public !== undefined)
      updateData.is_public = updates.is_public;
    if (updates.chain_context !== undefined)
      updateData.chain_context = updates.chain_context;
    if (updates.current_version_id !== undefined)
      updateData.current_version_id = updates.current_version_id;

    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update DefiStrategy: ${error.message}`);
    }

    if (!data) {
      throw new Error(`DefiStrategy with id ${id} not found`);
    }

    return data;
  }

  public async delete(id: string): Promise<void> {
    // First delete all strategy versions (cascade)
    const { error: versionError } = await this.supabase
      .getClient()
      .from('defi_strategy_versions')
      .delete()
      .eq('strategy_id', id);

    if (versionError) {
      throw new Error(
        `Failed to delete strategy versions: ${versionError.message}`,
      );
    }

    // Then delete the strategy itself
    const { error } = await this.supabase
      .getClient()
      .from('defi_strategies')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete DefiStrategy: ${error.message}`);
    }
  }
}
