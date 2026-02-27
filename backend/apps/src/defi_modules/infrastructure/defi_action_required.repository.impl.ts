import { Injectable } from '@nestjs/common';
import { DefiActionRequired } from '../domain/defi_action_required.entity';
import { DefiActionRequiredRepository } from '../domain/defi_action_required.repository';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiActionRequiredRepositoryImplement
  implements DefiActionRequiredRepository
{
  constructor(private readonly supabase: SupabaseService) {}

  async save(
    defiActionRequired: DefiActionRequired,
  ): Promise<DefiActionRequired> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_action_required')
      .upsert({
        id: defiActionRequired.id,
        action_id: defiActionRequired.action_id,
        module_id: defiActionRequired.module_id,
        action_required_id: defiActionRequired.action_required_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to save DefiActionRequired: ${error.message}`,
      );
    }

    return new DefiActionRequired(
      data.id,
      data.action_id,
      data.module_id,
      data.action_required_id,
    );
  }

  async findByActionId(actionId: string): Promise<DefiActionRequired[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_action_required')
      .select('*')
      .eq('action_id', actionId);

    if (error) {
      throw new Error(
        `Failed to find DefiActionRequired by action_id: ${error.message}`,
      );
    }

    return data.map(
      (item) =>
        new DefiActionRequired(
          item.id,
          item.action_id,
          item.module_id,
          item.action_required_id,
        ),
    );
  }

  async findRequiredActionsByActionId(actionId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_action_required')
      .select('action_required_id')
      .eq('action_id', actionId);

    if (error) {
      throw new Error(
        `Failed to find required actions: ${error.message}`,
      );
    }

    return data.map((item) => item.action_required_id);
  }
}
