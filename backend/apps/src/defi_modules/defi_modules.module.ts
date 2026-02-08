import { Module } from '@nestjs/common';
import { DefiModulesController } from './interfaces/defi_modules.controller';
import { DefiModulesRepository } from './domain/defi_modules.repository';
import { DefiModulesRepositoryImplement } from './infrastructure/defi_modules.repository.impl';
import { SupabaseModule } from 'src/shared/supabase.module';
import { DefiModulesService } from './application/defi_modules.service';
import { DefiModuleActionsRepository } from './domain/defi_module_actions.repository';
import { DefiModuleActionsRepositoryImplement } from './infrastructure/defi_module_actions.repository.impl';
import { DefiModuleActionsService } from './application/defi_module_actions.service';
import { DefiModuleActionRiskRepository } from './domain/defi_module_action_risk.repository';
import { DefiModuleActionRiskRepositoryImplement } from './infrastructure/defi_module_action_risk.repository.impl';

@Module({
  imports: [SupabaseModule],
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
      provide: DefiModuleActionRiskRepository,
      useClass: DefiModuleActionRiskRepositoryImplement,
    },
    DefiModulesService,
    DefiModuleActionsService,
  ],
  controllers: [DefiModulesController],
})
export class DefiModulesModule { }
