import { DefiTokenRepository } from '../domain/defi_token.repository';
import { DefiToken } from '../domain/defi_token.entity';
import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../shared/infrastructure/postgres.service';

@Injectable()
export class DefiTokenRepositoryImpl implements DefiTokenRepository {
  constructor(private readonly db: PostgresService) {}

  private toEntity(r: any): DefiToken {
    return new DefiToken(
      r.id,
      r.name,
      r.asset_id,
      r.chain ?? 'polkadot',
      r.chain_id ?? null,
      r.address ?? null,
      // Postgres smallint comes back as a number, but be explicit: 0 is a valid
      // decimals value, so only null/undefined may collapse to null.
      r.decimals ?? null,
    );
  }

  public async save(defiToken: DefiToken): Promise<DefiToken> {
    const row = await this.db.queryOne(
      `INSERT INTO defi_token (id, name, asset_id, chain, chain_id, address, decimals)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         asset_id = EXCLUDED.asset_id,
         chain = EXCLUDED.chain,
         chain_id = EXCLUDED.chain_id,
         address = EXCLUDED.address,
         decimals = EXCLUDED.decimals
       RETURNING *`,
      [
        defiToken.id,
        defiToken.name,
        defiToken.asset_id,
        defiToken.chain,
        defiToken.chain_id,
        // The DB rejects mixed-case addresses (see migration 0003); normalise
        // here so callers can pass a checksummed address from viem/ethers.
        defiToken.address ? defiToken.address.toLowerCase() : null,
        defiToken.decimals,
      ],
    );
    return this.toEntity(row);
  }

  public async findById(id: string): Promise<DefiToken | null> {
    const row = await this.db.queryOne('SELECT * FROM defi_token WHERE id = $1', [id]);
    return row ? this.toEntity(row) : null;
  }

  public async findByAssetId(assetId: number): Promise<DefiToken | null> {
    const row = await this.db.queryOne(
      'SELECT * FROM defi_token WHERE asset_id = $1',
      [assetId],
    );
    return row ? this.toEntity(row) : null;
  }

  public async findAll(chain?: string): Promise<DefiToken[]> {
    const rows = chain
      ? await this.db.query('SELECT * FROM defi_token WHERE chain = $1 ORDER BY name', [chain])
      : await this.db.query('SELECT * FROM defi_token ORDER BY chain, name');
    return rows.map((r) => this.toEntity(r));
  }
}
