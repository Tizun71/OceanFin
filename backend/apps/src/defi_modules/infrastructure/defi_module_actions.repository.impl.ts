import { DefiModuleAction } from '../domain/defi_module_actions.entity';
import { DefiModuleActionsRepository } from '../domain/defi_module_actions.repository';
import { SupabaseService } from 'src/shared/infrastructure/supabase.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefiModuleActionsRepositoryImplement
  implements DefiModuleActionsRepository
{
  constructor(private readonly supabase: SupabaseService) {}

  public async save(defiModuleAction: DefiModuleAction): Promise<void> {
    const { error } = await this.supabase
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
      });

    if (error) {
      throw new Error(`Failed to save DefiModuleAction: ${error.message}`);
    }
  }

  public async findById(id: string): Promise<DefiModuleAction | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_module_actions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapRowToEntity(data);
  }

  public async findAllByDefiModuleId(
    defiModuleId: string,
  ): Promise<DefiModuleAction[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_module_actions')
      .select('*')
      .eq('module_id', defiModuleId);

    if (!data || error) return [];

    return data.map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: any): DefiModuleAction {
    return new DefiModuleAction(
      row.id,
      row.module_id,
      row.name,
      row.pallet,
      row.call,
      row.description,
      row.param_schema,
      row.risk_level,
      row.is_active,
      new Date(row.created_at),
    );
  }
}
