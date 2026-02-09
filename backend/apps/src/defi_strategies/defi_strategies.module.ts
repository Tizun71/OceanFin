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

@Module({
  imports: [SupabaseModule, DefiUsersModule],
  controllers: [DefiStrategiesController],
  providers: [
    DefiStrategiesService,
    DefiStrategyVersionService,
    {
      provide: DefiStrategiesRepository,
      useClass: DefiStrategiesRepositoryImplement,
    },
    {
      provide: DefiStrategyVersionRepository,
      useClass: DefiStrategyVersionRepositoryImpl,
    },
  ],
  exports: [DefiStrategiesService, DefiStrategyVersionService],
})
export class DefiStrategiesModule {}
