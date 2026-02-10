import { Module } from '@nestjs/common';
import { DefiStrategiesRepositoryImplement } from './infrastructure/defi_strategies.repository.impl';
import { DefiStrategiesRepository } from './domain/defi_strategies.repository';
import { DefiStrategiesService } from './application/defi_strategies.service';
import { SupabaseModule } from '../shared/supabase.module';
import { DefiStrategiesController } from './interfaces/defi_strategies.controller';
import { DefiStrategyVersionService } from './application/defi_strategy_version.service';
import { DefiStrategyVersionRepository } from './domain/defi_strategy_version.repository';
import { DefiStrategyVersionRepositoryImpl } from './infrastructure/defi_strategy_version.repository.impl';
import { DefiUsersModule } from 'src/defi_users/defi_users.module';
import { DefiStrategySimulationSnapshotsController } from './interfaces/defi_strategy_simulation_snapshots.controller';
import { DefiStrategySimulationSnapshotService } from './application/defi_strategy_simullation_snapshot.service';
import { DefiStrategySimulationSnapshotRepositoryImpl } from './infrastructure/defi_strategy_simulation_snapshot.repository.impl';
import { DefiStrategySimulationSnapshotRepository } from './domain/defi_strategy_simulation_snapshot.repository';

@Module({
  imports: [SupabaseModule, DefiUsersModule],
  controllers: [
    DefiStrategiesController,
    DefiStrategySimulationSnapshotsController,
  ],
  providers: [
    DefiStrategiesService,
    DefiStrategyVersionService,
    DefiStrategySimulationSnapshotService,
    {
      provide: DefiStrategiesRepository,
      useClass: DefiStrategiesRepositoryImplement,
    },
    {
      provide: DefiStrategySimulationSnapshotRepository,
      useClass: DefiStrategySimulationSnapshotRepositoryImpl,
    },
    {
      provide: DefiStrategyVersionRepository,
      useClass: DefiStrategyVersionRepositoryImpl,
    },
  ],
  exports: [
    DefiStrategiesService,
    DefiStrategyVersionService,
    DefiStrategySimulationSnapshotService,
  ],
})
export class DefiStrategiesModule {}
