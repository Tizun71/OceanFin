import { Injectable } from "@nestjs/common";
import { DefiModuleActionsRepository } from "../domain/defi_module_actions.repository";
import { DefiModuleAction } from "../domain/defi_module_actions.entity";
import { DefiModulesService } from "./defi_modules.service";
import { v4 as uuidv4 } from "uuid";
import { CreateDefiModuleActionDto } from "../interfaces/dtos/create_defi_module_action.dto";

@Injectable()
export class DefiModuleActionsService {
  constructor(
    private readonly defiModuleActionsRepository: DefiModuleActionsRepository,
    private readonly defiModulesService: DefiModulesService,
  ) {}

  async createAction(data: CreateDefiModuleActionDto): Promise<DefiModuleAction> {
    // Throw 404 if the module does not exist
    await this.defiModulesService.getById(data.module_id);

    return this.defiModuleActionsRepository.save(
      new DefiModuleAction(
        uuidv4(),
        data.module_id,
        data.name,
        data.pallet,
        data.call,
        data.description,
        data.param_schema,
        data.risk_level,
        data.is_active,
        new Date(),
      ),
    );
  }
}
