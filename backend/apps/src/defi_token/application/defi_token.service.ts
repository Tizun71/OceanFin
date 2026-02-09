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
}
