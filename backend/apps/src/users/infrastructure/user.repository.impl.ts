import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { SupabaseService } from 'src/shared/infrastructure/supabase.service';

@Injectable()
export class UserRepositoryImplement implements UserRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return new User(data.id, data.wallet_address, data.chain_id);
  }

  async save(user: User): Promise<void> {
    const { error } = await this.supabase.getClient().from('users').upsert({
      id: user.id,
      wallet_address: user.walletAddress,
      chain_id: user.chainId,
    });

    if (error) {
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('users')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return (data || []).map(
      (u) => new User(u.id, u.wallet_address, u.chain_id),
    );
  }
}
