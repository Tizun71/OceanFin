import { Module } from '@nestjs/common';
import { DefiModulesController } from './interfaces/defi_modules.controller';
import { DefiModulesRepository } from './domain/defi_modules.repository';
import { DefiModulesRepositoryImplement } from './infrastructure/defi_modules.repository.impl';
import { SupabaseModule } from 'src/shared/supabase.module';
import { DefiModulesService } from './application/defi_modules.service';
import { DefiModuleActionsRepository } from './domain/defi_module_actions.repository';
import { DefiModuleActionsRepositoryImplement } from './infrastructure/defi_module_actions.repository.impl';
import { DefiModuleActionsService } from './application/defi_module_actions.service';
import { DefiPairsRepository } from './domain/defi_pairs.repository';
import { DefiPairsRepositoryImpl } from './infrastructure/defi_pairs.repository.impl';
import { DefiPairsService } from './application/defi_pairs.service';
import { DefiTokenModule } from '../defi_token/defi_token.module';

@Module({
  imports: [SupabaseModule, DefiTokenModule],
  providers: [
    {
      provide: DefiModulesRepository,
      useClass: DefiModulesRepositoryImplement,
    },
    {
      provide: DefiModuleActionsRepository,
      useClass: DefiModuleActionsRepositoryImplement,
    },
    {
      provide: DefiPairsRepository,
      useClass: DefiPairsRepositoryImpl,
    },
    DefiModulesService,
    DefiModuleActionsService,
    DefiPairsService,
  ],
  controllers: [DefiModulesController],
})
export class DefiModulesModule {}
