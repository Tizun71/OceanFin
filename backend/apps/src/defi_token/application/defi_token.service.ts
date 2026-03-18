import { DefiTokenRepository } from '../domain/defi_token.repository';
import { DefiToken } from '../domain/defi_token.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDefiTokenDto } from '../interfaces/dto/create_defi_token.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiTokenService {
  constructor(private readonly defiTokenRepository: DefiTokenRepository) {}

  public async createDefiToken(data: CreateDefiTokenDto): Promise<DefiToken> {
    const defiToken = new DefiToken(uuidv4(), data.name, data.asset_id);
    return this.defiTokenRepository.save(defiToken);
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

  public async getAllDefiTokens(): Promise<DefiToken[]> {
    return this.defiTokenRepository.findAll();
  }
}
