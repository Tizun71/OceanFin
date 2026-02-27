import { Injectable } from "@nestjs/common";
import { DefiActionRequired } from "../domain/defi_action_required.entity";
import { DefiActionRequiredRepository } from "../domain/defi_action_required.repository";
import { SupabaseService } from "../../shared/infrastructure/supabase.service";
import { DefiModuleAction } from "../domain/defi_module_actions.entity";

@Injectable()
export class DefiActionRequiredRepositoryImplement implements DefiActionRequiredRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async save(defiActionRequired: DefiActionRequired): Promise<DefiActionRequired> {
    const { data, error } = await this.supabase
      .getClient()
      .from("defi_action_required")
      .upsert({
        id: defiActionRequired.id,
        action_id: defiActionRequired.action_id,
        module_id: defiActionRequired.module_id,
        action_required_id: defiActionRequired.action_required_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save DefiActionRequired: ${error.message}`);
    }

    return new DefiActionRequired(data.id, data.action_id, data.module_id, data.action_required_id);
  }

  async findByActionId(actionId: string): Promise<DefiActionRequired[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from("defi_action_required")
      .select("*")
      .eq("action_id", actionId);

    if (error) {
      throw new Error(`Failed to find DefiActionRequired by action_id: ${error.message}`);
    }

    return data.map(
      (item) =>
        new DefiActionRequired(item.id, item.action_id, item.module_id, item.action_required_id),
    );
  }

  async findRequiredActionsByActionId(actionId: string): Promise<DefiModuleAction[]> {
    let { data: actionRequired, error } = await this.supabase
      .getClient()
      .from("defi_action_required")
      .select("defi_module_actions:action_required_id(*)")
      .eq("action_id", actionId);

    actionRequired = actionRequired?.map((item) => item.defi_module_actions) as any;

    if (error) {
      throw new Error(`Failed to find required actions: ${error.message}`);
    }

    const { data: defiModules } = await this.supabase.getClient().from("defi_modules").select(`*,
      defi_module_actions(
        *,
        defi_pairs (
          id,
          token_in:defi_token!defi_pairs_token_in_id_fkey (*),
          token_out:defi_token!defi_pairs_token_out_id_fkey (*)
        )
      )`);

    const filteredData = defiModules?.map((item) => {
      return {
        ...item,
        defi_module_actions:
          actionRequired?.length !== 0
            ? item.defi_module_actions.filter((defi_action) =>
                actionRequired?.some((action: any) => defi_action.id === action.id),
              )
            : item.defi_module_actions,
      };
    });

    return filteredData as any;
  }
}
