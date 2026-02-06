import { DefiModuleAction } from './defi_module_actions.entity';

export abstract class DefiModuleActionsRepository {
  abstract save(defiModuleAction: DefiModuleAction): Promise<void>;
  abstract findById(id: string): Promise<DefiModuleAction | null>;
  abstract findAllByDefiModuleId(
    defiModuleId: string,
  ): Promise<DefiModuleAction[]>;
}
