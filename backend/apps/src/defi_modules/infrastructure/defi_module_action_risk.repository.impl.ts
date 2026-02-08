import { DefiModuleActionRisksRepository } from "../domain/defi_module_action_risks.repository";
import { DefiModuleActionRisk } from "../domain/defi_module_action_risk.entity";
import { SupabaseService } from "src/shared/infrastructure/supabase.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DefiModuleActionRiskRepositoryImplement implements DefiModuleActionRisksRepository {
    constructor(private readonly supabase: SupabaseService) { }

    async save(defiModuleActionRisk: DefiModuleActionRisk): Promise<DefiModuleActionRisk> {
        const { data, error } = await this.supabase
            .getClient()
            .from('defi_module_action_risks')
            .upsert({
                id: defiModuleActionRisk.id,
                module_action_id: defiModuleActionRisk.module_action_id,
                risk_type: defiModuleActionRisk.risk_type,
                severity: defiModuleActionRisk.severity,
                description: defiModuleActionRisk.description
            }).select().single();

        if (error) {
            throw new Error(`Failed to save DefiModuleActionRisk: ${error.message}`);
        }

        return new DefiModuleActionRisk(
            data.id,
            data.module_action_id,
            data.risk_type,
            data.severity,
            data.description
        );
    }
}