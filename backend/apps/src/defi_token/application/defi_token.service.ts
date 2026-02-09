import { DefiTokenRepository } from '../domain/defi_token.repository';
import { DefiToken } from '../domain/defi_token.entity';
import { Injectable } from '@nestjs/common';
import { CreateDefiTokenDto } from '../interfaces/dto/create_defi_token.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiTokenService {
  constructor(private readonly defiTokenRepository: DefiTokenRepository) {}

  public async createDefiToken(data: CreateDefiTokenDto): Promise<DefiToken> {
    const defiToken = new DefiToken(uuidv4(), data.name, data.asset_id);
    return this.defiTokenRepository.save(defiToken);
  }
}
