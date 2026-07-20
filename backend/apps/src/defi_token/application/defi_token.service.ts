import { DefiTokenRepository } from '../domain/defi_token.repository';
import { DefiToken } from '../domain/defi_token.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDefiTokenDto } from '../interfaces/dto/create_defi_token.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiTokenService {
  constructor(private readonly defiTokenRepository: DefiTokenRepository) {}

  public async createDefiToken(data: CreateDefiTokenDto): Promise<DefiToken> {
    const chain = data.chain ?? 'polkadot';
    this.assertChainMetadataConsistent(chain, data.address, data.decimals, data.asset_id);

    const defiToken = new DefiToken(
      uuidv4(),
      data.name,
      data.asset_id ?? null,
      chain,
      data.chain_id ?? null,
      data.address ?? null,
      data.decimals ?? null,
    );
    return this.defiTokenRepository.save(defiToken);
  }

  /**
   * Migration 0003 enforces this split at the DB level too, but a check
   * constraint surfaces as a 500. Fail here so the caller gets a 400 naming the
   * field that is wrong.
   */
  private assertChainMetadataConsistent(
    chain: string,
    address?: string,
    decimals?: number,
    assetId?: number,
  ): void {
    const isSubstrate = chain === 'polkadot';

    if (isSubstrate) {
      if (address !== undefined || decimals !== undefined) {
        throw new BadRequestException(
          'Substrate tokens must not carry address/decimals; they are identified by asset_id',
        );
      }
      if (assetId === undefined || assetId === null) {
        throw new BadRequestException('Substrate tokens require asset_id');
      }
      return;
    }

    if (address === undefined || decimals === undefined) {
      throw new BadRequestException(
        `EVM token on chain '${chain}' requires both address and decimals`,
      );
    }
  }

  public async getDefiTokenById(id: string): Promise<DefiToken> {
    const defiToken = await this.defiTokenRepository.findById(id);
    if (!defiToken) {
      throw new NotFoundException('DefiToken not found');
    }
    return defiToken;
  }

  public async getDefiTokenByAssetId(assetId: string): Promise<DefiToken> {
    const assetIdNumber = parseInt(assetId, 10);
    if (isNaN(assetIdNumber)) {
      throw new NotFoundException('Invalid asset ID format');
    }
    
    const defiToken = await this.defiTokenRepository.findByAssetId(assetIdNumber);
    if (!defiToken) {
      throw new NotFoundException(`DefiToken not found for asset_id: ${assetId}`);
    }
    return defiToken;
  }

  public async getAllDefiTokens(chain?: string): Promise<DefiToken[]> {
    return this.defiTokenRepository.findAll(chain);
  }
}
