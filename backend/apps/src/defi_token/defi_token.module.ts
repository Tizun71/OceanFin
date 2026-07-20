import { Module } from '@nestjs/common';
import { DefiTokenRepositoryImpl } from './infrastructure/defi_token.repository.impl';
import { DefiTokenRepository } from './domain/defi_token.repository';
import { DefiTokenService } from './application/defi_token.service';
import { DatabaseModule } from '../shared/database.module';
import { DefiTokenController } from './interfaces/defi_token.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [DefiTokenController],
  providers: [
    DefiTokenService,
    {
      provide: DefiTokenRepository,
      useClass: DefiTokenRepositoryImpl,
    },
  ],
  exports: [DefiTokenService],
})
export class DefiTokenModule {}
