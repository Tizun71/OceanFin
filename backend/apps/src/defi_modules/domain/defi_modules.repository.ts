import { DefiModuleAction } from './defi_module_actions.entity';
import { DefiModule } from './defi_modules.entity';

export abstract class DefiModulesRepository {
  abstract save(defiModule: DefiModule): Promise<DefiModule>;
  abstract findAll(): Promise<(DefiModule & { defi_module_actions: (DefiModuleAction & { defi_module_action_risks: DefiModuleAction[] })[] })[]>;
  abstract findById(id: string): Promise<DefiModule & { defi_module_actions: (DefiModuleAction & { defi_module_action_risks: DefiModuleAction[] })[] } | null>;
}
