import { Module } from '@nestjs/common';
import { StrategiesController } from './interfaces/stategies.controller';
import { StrategyService } from './application/strategy.service';
import { StrategiesRepository } from './domain/strategies.repository';
import { StrategiesRepositoryImplement } from './infrastructure/strategies.repository.impl';
import { SupabaseModule } from '../shared/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [StrategiesController],
  providers: [
    StrategyService,
    { provide: StrategiesRepository, useClass: StrategiesRepositoryImplement },
  ],
  exports: [StrategyService],
})
export class StrategiesModule {}



