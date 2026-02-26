import { DefiTokenRepository } from '../domain/defi_token.repository';
import { DefiToken } from '../domain/defi_token.entity';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiTokenRepositoryImpl implements DefiTokenRepository {
  constructor(private readonly supabase: SupabaseService) {}

  public async save(defiToken: DefiToken): Promise<DefiToken> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_token')
      .upsert({
        id: defiToken.id,
        name: defiToken.name,
        asset_id: defiToken.asset_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save DefiToken: ${error.message}`);
    }

    return data;
  }

  public async findById(id: string): Promise<DefiToken | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_token')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find DefiToken by id: ${error.message}`);
    }

    return data;
  }
}
