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

  public async getByOwnerId(
    owner_id: string,
  ): Promise<
    (DefiStrategy & { defi_strategy_versions: DefiStrategyVersion[] })[]
  > {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategies')
      .select('*, defi_strategy_versions(*)')
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `Failed to get DefiStrategies by owner: ${error.message}`,
      );
    }

    return data || [];
  }
}
