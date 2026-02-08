import { Injectable } from '@nestjs/common';
import { DefiModuleActionsRepository } from '../domain/defi_module_actions.repository';
import { DefiModuleAction } from '../domain/defi_module_actions.entity';
import { DefiModulesService } from './defi_modules.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiModuleActionsService {
  constructor(
    private readonly defiModuleActionsRepository: DefiModuleActionsRepository,
    private readonly defiModulesService: DefiModulesService,
  ) { }

  async createAction(
    moduleId: string,
    actionData: {
      name: string;
      pallet: string;
      call: string;
      description: string;
      param_schema: object;
      risk_level: string;
      is_active: boolean;
    },
  ) {
    // Throw 404 if the module does not exist
    await this.defiModulesService.getById(moduleId);

    return this.defiModuleActionsRepository.save(
      new DefiModuleAction(
        uuidv4(),
        moduleId,
        actionData.name,
        actionData.pallet,
        actionData.call,
        actionData.description,
        actionData.param_schema,
        actionData.risk_level,
        actionData.is_active,
        new Date(),
      ),
    );
  }
}
