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
}
