import { DefiModuleActionRisk } from "./defi_module_action_risk.entity";

export abstract class DefiModuleActionRiskRepository {
    abstract save(defiModuleActionRisk: DefiModuleActionRisk): Promise<void>;
}