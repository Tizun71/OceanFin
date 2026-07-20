import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { PostgresService } from 'src/shared/infrastructure/postgres.service';

@Injectable()
export class UserRepositoryImplement implements UserRepository {
  constructor(private readonly db: PostgresService) {}

  private toEntity(r: any): User {
    return new User(r.id, r.wallet_address, r.chain_id, r.username);
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.queryOne('SELECT * FROM users WHERE id = $1', [id]);
    return row ? this.toEntity(row) : null;
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const row = await this.db.queryOne(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress],
    );
    return row ? this.toEntity(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.db.query(
      `INSERT INTO users (id, wallet_address, chain_id, username)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         wallet_address = EXCLUDED.wallet_address,
         chain_id = EXCLUDED.chain_id,
         username = EXCLUDED.username`,
      [user.id, user.walletAddress, user.chainId, user.username],
    );
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db.query('SELECT * FROM users');
    return rows.map((u) => this.toEntity(u));
  }
}
