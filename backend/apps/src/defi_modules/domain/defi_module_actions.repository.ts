import { DefiModuleAction } from './defi_module_actions.entity';

export abstract class DefiModuleActionsRepository {
  abstract save(defiModuleAction: DefiModuleAction): Promise<DefiModuleAction>;
}
