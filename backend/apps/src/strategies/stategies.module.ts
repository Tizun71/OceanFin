import { Module } from '@nestjs/common';
import { StrategiesController } from './interfaces/stategies.controller';
import { StrategyService } from './application/strategy.service';
import { StrategiesRepository } from './domain/strategies.repository';
import { StrategiesRepositoryImplement } from './infrastructure/strategies.repository.impl';
import { DatabaseModule } from '../shared/database.module';
import { HydrationSdkService } from '../shared/infrastructure/hydration-sdk.service';
import { HydrationStrategyService } from './application/hydration-strategy.service';
import { HydrationPoolService } from './application/hydration-pool.service';
import { RewardsService } from './application/rewards.service';
import { AvalancheApyService } from './application/avalanche-apy.service';
import { StrategySimulationService } from './application/strategy-simulation.service';
import { EvmWorkflowSimulationService } from './application/evm-workflow-simulation.service';
import { DefiStrategiesModule } from '../defi_strategies/defi_strategies.module';

@Module({
  // DefiStrategiesModule supplies the seeded EVM workflows that back the
  // Avalanche marketplace strategies (same row ids).
  imports: [DatabaseModule, DefiStrategiesModule],
  controllers: [StrategiesController],
  providers: [
    StrategyService,
    HydrationSdkService,
    HydrationStrategyService,
    HydrationPoolService,
    RewardsService,
    AvalancheApyService,
    StrategySimulationService,
    EvmWorkflowSimulationService,
    { provide: StrategiesRepository, useClass: StrategiesRepositoryImplement },
  ],
  exports: [
    StrategyService,
    AvalancheApyService,
    HydrationStrategyService,
    HydrationPoolService,
    RewardsService,
    StrategySimulationService,
  ],
})
export class StrategiesModule {}



