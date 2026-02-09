import { Module } from '@nestjs/common';
import { DefiTokenRepositoryImpl } from './infrastructure/defi_token.repository.impl';
import { DefiTokenRepository } from './domain/defi_token.repository';
import { DefiTokenService } from './application/defi_token.service';
import { SupabaseModule } from '../shared/supabase.module';
import { DefiTokenController } from './interfaces/defi_token.controller';

@Module({
  imports: [SupabaseModule],
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
