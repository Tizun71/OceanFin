import { Module } from '@nestjs/common';
import { StrategiesController } from './interfaces/stategies.controller';
import { StrategyService } from './application/strategy.service';
import { StrategiesRepository } from './domain/strategies.repository';
import { StrategiesRepositoryImplement } from './infrastructure/strategies.repository.impl';
import { SupabaseModule } from '../shared/supabase.module';
import { HydrationSdkService } from '../shared/infrastructure/hydration-sdk.service';
import { HydrationStrategyService } from './application/hydration-strategy.service';
import { HydrationPoolService } from './application/hydration-pool.service';
import { RewardsService } from './application/rewards.service';
import { StrategySimulationService } from './application/strategy-simulation.service';

@Module({
  imports: [SupabaseModule],
  controllers: [StrategiesController],
  providers: [
    StrategyService,
    HydrationSdkService,
    HydrationStrategyService,
    HydrationPoolService,
    RewardsService,
    StrategySimulationService,
    { provide: StrategiesRepository, useClass: StrategiesRepositoryImplement },
  ],
  exports: [
    StrategyService,
    HydrationStrategyService,
    HydrationPoolService,
    RewardsService,
    StrategySimulationService,
  ],
})
export class StrategiesModule {}



