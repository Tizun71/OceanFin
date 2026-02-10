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
import { DefiStrategyWorkflowNodeRepository } from './domain/defi_strategy_workflow_node.repository';
import { DefiStrategyWorkflowNodeRepositoryImpl } from './infrastructure/defi_strategy_workflow_node.repository.impl';
import { DefiStrategyWorkflowNodeService } from './application/defi_strategy_workflow_node.service';
import { DefiStrategyWorkflowNodesController } from './interfaces/defi_strategy_workflow_nodes.controller';
import { DefiStrategyExecutionRepository } from './domain/defi_strategy_execution.repository';
import { DefiStrategyExecutionRepositoryImpl } from './infrastructure/defi_strategy_execution.repository.impl';
import { DefiStrategyExecutionService } from './application/defi_strategy_execution.service';
import { DefiStrategyExecutionsController } from './interfaces/defi_strategy_executions.controller';
import { DefiExecutionStepResultRepositoryImpl } from './infrastructure/defi_execution_step_result.repository.impl';
import { DefiExecutionStepResultRepository } from './domain/defi_execution_step_result.repository';
import { DefiExecutionStepResultService } from './application/defi_execution_step_result.service';
import { DefiExecutionStepResultController } from './interfaces/defi_execution_step_result.controller';

@Module({
  imports: [SupabaseModule, DefiUsersModule, DefiStrategiesModule],
  controllers: [
    DefiStrategiesController,
    DefiStrategySimulationSnapshotsController,
    DefiStrategyWorkflowNodesController,
    DefiStrategyExecutionsController,
    DefiExecutionStepResultController,
  ],
  providers: [
    DefiStrategiesService,
    DefiStrategyVersionService,
    DefiStrategyWorkflowNodeService,
    DefiStrategySimulationSnapshotService,
    DefiStrategyExecutionService,
    DefiExecutionStepResultService,
    {
      provide: DefiStrategiesRepository,
      useClass: DefiStrategiesRepositoryImplement,
    },
    {
      provide: DefiStrategySimulationSnapshotRepository,
      useClass: DefiStrategySimulationSnapshotRepositoryImpl,
    },
    {
      provide: DefiStrategyWorkflowNodeRepository,
      useClass: DefiStrategyWorkflowNodeRepositoryImpl,
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
    DefiStrategyWorkflowNodeService,
    DefiExecutionStepResultService,
  ],
})
export class DefiStrategiesModule {}
