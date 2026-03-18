import { Module } from '@nestjs/common';
import { DefiStrategiesRepositoryImplement } from './infrastructure/defi_strategies.repository.impl';
import { DefiStrategiesRepository } from './domain/defi_strategies.repository';
import { DefiStrategiesService } from './application/defi_strategies.service';
import { SupabaseModule } from '../shared/supabase.module';
import { DefiStrategiesController } from './interfaces/defi_strategies.controller';
import { DefiStrategyVersionService } from './application/defi_strategy_version.service';
import { DefiStrategyVersionRepository } from './domain/defi_strategy_version.repository';
import { DefiStrategyVersionRepositoryImpl } from './infrastructure/defi_strategy_version.repository.impl';
import { UsersModule } from '../users/users.module';
import { DefiStrategySimulationSnapshotsController } from './interfaces/defi_strategy_simulation_snapshots.controller';
import { DefiStrategySimulationSnapshotService } from './application/defi_strategy_simullation_snapshot.service';
import { DefiStrategySimulationSnapshotRepositoryImpl } from './infrastructure/defi_strategy_simulation_snapshot.repository.impl';
import { DefiStrategySimulationSnapshotRepository } from './domain/defi_strategy_simulation_snapshot.repository';
import { DefiStrategyExecutionRepository } from './domain/defi_strategy_execution.repository';
import { DefiStrategyExecutionRepositoryImpl } from './infrastructure/defi_strategy_execution.repository.impl';
import { DefiStrategyExecutionService } from './application/defi_strategy_execution.service';
import { DefiStrategyExecutionsController } from './interfaces/defi_strategy_executions.controller';
import { DefiExecutionStepResultRepositoryImpl } from './infrastructure/defi_execution_step_result.repository.impl';
import { DefiExecutionStepResultRepository } from './domain/defi_execution_step_result.repository';
import { DefiExecutionStepResultService } from './application/defi_execution_step_result.service';
import { DefiExecutionStepResultController } from './interfaces/defi_execution_step_result.controller';
import { StrategySimulationService } from './application/strategy-simulation.service';
import { SwapSimulator } from './application/simulators/swap-simulator';
import { BridgeSimulator } from './application/simulators/bridge-simulator';
import { StakeSimulator } from './application/simulators/stake-simulator';
import { JoinStrategySimulator } from './application/simulators/join-strategy-simulator';
import { BorrowSimulator } from './application/simulators/borrow-simulator';
import { SupplySimulator } from './application/simulators/supply-simulator';
import { EnableEModeSimulator } from './application/simulators/enable-e-mode-simulator';
import { EnableBorrowingSimulator } from './application/simulators/enable-borrowing-simulator';
import { HydrationStrategyService } from 'src/strategies/application/hydration-strategy.service';
import { HydrationSdkService } from 'src/shared/infrastructure/hydration-sdk.service';

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [
    DefiStrategiesController,
    DefiStrategySimulationSnapshotsController,
    DefiStrategyExecutionsController,
    DefiExecutionStepResultController,
  ],
  providers: [
    DefiStrategiesService,
    DefiStrategyVersionService,
    DefiStrategySimulationSnapshotService,
    DefiStrategyExecutionService,
    DefiExecutionStepResultService,
    StrategySimulationService,
    SwapSimulator,
    BridgeSimulator,
    StakeSimulator,
    JoinStrategySimulator,
    BorrowSimulator,
    SupplySimulator,
    EnableEModeSimulator,
    EnableBorrowingSimulator,
    HydrationStrategyService,
    HydrationSdkService,
    {
      provide: DefiStrategiesRepository,
      useClass: DefiStrategiesRepositoryImplement,
    },
    {
      provide: DefiStrategySimulationSnapshotRepository,
      useClass: DefiStrategySimulationSnapshotRepositoryImpl,
    },
    {
      provide: DefiStrategyExecutionRepository,
      useClass: DefiStrategyExecutionRepositoryImpl,
    },
    {
      provide: DefiStrategyVersionRepository,
      useClass: DefiStrategyVersionRepositoryImpl,
    },
    {
      provide: DefiExecutionStepResultRepository,
      useClass: DefiExecutionStepResultRepositoryImpl,
    },
  ],
  exports: [
    DefiStrategiesService,
    DefiStrategyVersionService,
    DefiStrategySimulationSnapshotService,
    DefiExecutionStepResultService,
    StrategySimulationService,
    HydrationStrategyService,
  ],
})
export class DefiStrategiesModule {}
