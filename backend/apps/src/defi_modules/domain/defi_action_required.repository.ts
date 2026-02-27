import { DefiActionRequired } from './defi_action_required.entity';
import { DefiModuleAction } from './defi_module_actions.entity';

export abstract class DefiActionRequiredRepository {
  abstract save(defiActionRequired: DefiActionRequired): Promise<DefiActionRequired>;
  abstract findByActionId(actionId: string): Promise<DefiActionRequired[]>;
  abstract findRequiredActionsByActionId(actionId: string): Promise<DefiModuleAction[]>;
}
