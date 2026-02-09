import { Injectable } from '@nestjs/common';
import { DefiPairsRepository } from '../domain/defi_pairs.repository';
import { DefiPair } from '../domain/defi_pairs.entity';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiPairsRepositoryImpl implements DefiPairsRepository {
  constructor(private readonly supabase: SupabaseService) {}

  public async save(defiPair: DefiPair): Promise<DefiPair> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_pairs')
      .upsert({
        id: defiPair.id,
        action_id: defiPair.action_id,
        token_in_id: defiPair.token_in_id,
        token_out_id: defiPair.token_out_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save DefiPair: ${error.message}`);
    }

    return data;
  }
}
