import { DefiModuleActionRisk } from "./defi_module_action_risk.entity";

export abstract class DefiModuleActionRisksRepository {
    abstract save(defiModuleActionRisk: DefiModuleActionRisk): Promise<DefiModuleActionRisk>;
}