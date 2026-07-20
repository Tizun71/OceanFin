import { DefiToken } from './defi_token.entity';

export abstract class DefiTokenRepository {
  abstract save(defiToken: DefiToken): Promise<DefiToken>;
  abstract findById(id: string): Promise<DefiToken | null>;
  abstract findByAssetId(assetId: number): Promise<DefiToken | null>;
  /** Optionally scoped to a chain slug ('polkadot' | 'avalanche' | ...). */
  abstract findAll(chain?: string): Promise<DefiToken[]>;
}
