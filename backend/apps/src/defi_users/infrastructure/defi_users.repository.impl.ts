import { DefiUsersRepository } from '../domain/defi_users.repository';
import { DefiUser } from '../domain/defi_user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiUsersRepositoryImplement implements DefiUsersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createDefiUser(defiUser: DefiUser): Promise<DefiUser> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('defi_users')
      .insert([
        {
          id: defiUser.id,
          wallet_address: defiUser.wallet_address,
          wallet_type: defiUser.wallet_type,
          created_at: defiUser.created_at,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create DefiUser: ${error.message}`);
    }

    return new DefiUser(
      data.id,
      data.wallet_address,
      data.wallet_type,
      data.created_at,
    );
  }

  async getDefiUserByWalletAddress(walletAddress: string): Promise<DefiUser> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('defi_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (!data) {
      throw new NotFoundException(
        `DefiUser with wallet address ${walletAddress} not found`,
      );
    }

    if (error) {
      throw new Error(`Failed to get DefiUser: ${error.message}`);
    }

    return new DefiUser(
      data.id,
      data.wallet_address,
      data.wallet_type,
      data.created_at,
    );
  }

  async getDefiUserById(id: string): Promise<DefiUser> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('defi_users')
      .select('*')
      .eq('id', id)
      .single();

    if (!data) {
      throw new NotFoundException(`DefiUser with id ${id} not found`);
    }

    if (error) {
      throw new Error(`Failed to get DefiUser: ${error.message}`);
    }

    return new DefiUser(
      data.id,
      data.wallet_address,
      data.wallet_type,
      data.created_at,
    );
  }
}
