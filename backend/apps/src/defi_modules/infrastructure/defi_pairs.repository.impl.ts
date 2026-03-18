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

  public async findAll(): Promise<DefiPair[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_pairs')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch DefiPairs: ${error.message}`);
    }

    return data.map(row => new DefiPair(
      row.id,
      row.action_id,
      row.token_in_id,
      row.token_out_id
    ));
  }

  public async findByActionId(actionId: string): Promise<DefiPair[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_pairs')
      .select('*')
      .eq('action_id', actionId);

    if (error) {
      throw new Error(`Failed to fetch DefiPairs by action: ${error.message}`);
    }

    return data.map(row => new DefiPair(
      row.id,
      row.action_id,
      row.token_in_id,
      row.token_out_id
    ));
  }

  public async findByTokenInId(tokenInId: string): Promise<DefiPair[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_pairs')
      .select('*')
      .eq('token_in_id', tokenInId);

    if (error) {
      throw new Error(`Failed to fetch DefiPairs by token_in: ${error.message}`);
    }

    return data.map(row => new DefiPair(
      row.id,
      row.action_id,
      row.token_in_id,
      row.token_out_id
    ));
  }

  public async findByTokenOutId(tokenOutId: string): Promise<DefiPair[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_pairs')
      .select('*')
      .eq('token_out_id', tokenOutId);

    if (error) {
      throw new Error(`Failed to fetch DefiPairs by token_out: ${error.message}`);
    }

    return data.map(row => new DefiPair(
      row.id,
      row.action_id,
      row.token_in_id,
      row.token_out_id
    ));
  }

  public async findByTokenPair(tokenInId: string, tokenOutId: string): Promise<DefiPair[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_pairs')
      .select('*')
      .eq('token_in_id', tokenInId)
      .eq('token_out_id', tokenOutId);

    if (error) {
      throw new Error(`Failed to fetch DefiPairs by token pair: ${error.message}`);
    }

    return data.map(row => new DefiPair(
      row.id,
      row.action_id,
      row.token_in_id,
      row.token_out_id
    ));
  }
}
