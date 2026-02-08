import { DefiModuleAction } from '../domain/defi_module_actions.entity';
import { DefiModuleActionsRepository } from '../domain/defi_module_actions.repository';
import { SupabaseService } from 'src/shared/infrastructure/supabase.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefiModuleActionsRepositoryImplement
  implements DefiModuleActionsRepository {
  constructor(private readonly supabase: SupabaseService) { }

  public async save(defiModuleAction: DefiModuleAction): Promise<DefiModuleAction> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_module_actions')
      .upsert({
        id: defiModuleAction.id,
        module_id: defiModuleAction.module_id,
        name: defiModuleAction.name,
        pallet: defiModuleAction.pallet,
        call: defiModuleAction.call,
        description: defiModuleAction.description,
        param_schema: defiModuleAction.param_schema,
        risk_level: defiModuleAction.risk_level,
        is_active: defiModuleAction.is_active,
        created_at: defiModuleAction.created_at,
      }).select().single();

    if (error) {
      throw new Error(`Failed to save DefiModuleAction: ${error.message}`);
    }

    return new DefiModuleAction(
      data.id,
      data.module_id,
      data.name,
      data.pallet,
      data.call,
      data.description,
      data.param_schema,
      data.risk_level,
      data.is_active,
      new Date(data.created_at),
    );
  }
}
