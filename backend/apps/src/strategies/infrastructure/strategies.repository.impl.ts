import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/shared/infrastructure/supabase.service';
import { StrategiesRepository } from '../domain/strategies.repository';
import { Strategy } from '../domain/strategies.entity';
import { UUID } from 'crypto';

@Injectable()
export class StrategiesRepositoryImplement implements StrategiesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findById(id: UUID): Promise<Strategy | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('strategies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapRowToEntity(data);
  }

  async findAll(sortBy?: string, order: 'asc' | 'desc' = 'desc', limit?: number): Promise<Strategy[]> {
  let query = this.supabase.getClient().from('strategies').select('*');

  if (sortBy) {
    query = query.order(sortBy, { ascending: order === 'asc' });
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch strategies: ${error.message}`);

  return (data ?? []).map((r) => this.mapRowToEntity(r));
}


  async save(strategy: Strategy): Promise<void> {
    const { error } = await this.supabase.getClient().from('strategies').upsert({
      id: strategy.id,
      strategist_name: strategy.strategistName,
      strategist_handle: strategy.strategistHandle,
      apy: strategy.apy,
      tags: strategy.tags,
      assets: strategy.assets,
      agents: strategy.agents,
      chains: strategy.chains,
    });

    if (error) throw new Error(`Failed to save strategy: ${error.message}`);
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('strategies')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`Failed to delete strategy: ${error.message}`);
  }

  private mapRowToEntity(row: any): Strategy {
    return new Strategy(
      row.id,
      row.strategist_name,
      row.apy,
      row.tags ?? [],
      row.strategist_handle ?? undefined,
      row.assets ?? [],
      row.agents ?? [],
      row.chains ?? [],
    );
  }
}



