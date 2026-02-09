import { Injectable } from '@nestjs/common';
import { DefiPair } from '../domain/defi_pairs.entity';
import { DefiPairsRepository } from '../domain/defi_pairs.repository';
import { DefiTokenService } from 'src/defi_token/application/defi_token.service';

@Injectable()
export class DefiPairsService {
  constructor(
    private readonly defiPairsRepository: DefiPairsRepository,
    private readonly defiTokenService: DefiTokenService,
  ) {}

  async createDefiPair(defiPair: DefiPair): Promise<DefiPair> {
    await Promise.all([
      this.defiTokenService.getDefiTokenById(defiPair.token_in_id),
      this.defiTokenService.getDefiTokenById(defiPair.token_out_id),
    ]);

    return this.defiPairsRepository.save(defiPair);
  }
}
