import { Injectable } from '@nestjs/common';
import { DefiModulesRepository } from '../domain/defi_modules.repository';
import { DefiModule } from '../domain/defi_modules.entity';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';

@Injectable()
export class DefiModulesRepositoryImplement implements DefiModulesRepository {
  constructor(private readonly supabase: SupabaseService) { }

  async findAll() {
    let { error, data } = await this.supabase
      .getClient()
      .from('defi_modules')
      .select('*, defi_module_actions(*, defi_pairs(*))');

    if (error) throw new Error(`Failed to fetch DefiModules: ${error.message}`);

    return data as any;
  }

  async save(defiModule: DefiModule): Promise<DefiModule> {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_modules')
      .upsert({
        id: defiModule.id,
        name: defiModule.name,
        protocol: defiModule.protocol,
        category: defiModule.category,
        parachain_id: defiModule.parachain_id,
        icon_url: defiModule.icon_url,
        description: defiModule.description,
        website_url: defiModule.website_url,
        is_active: defiModule.is_active,
        created_at: defiModule.created_at,
      }).select().single();

    if (error) {
      throw new Error(`Failed to save DefiModule: ${error.message}`);
    }

    return new DefiModule(
      data.id,
      data.name,
      data.protocol,
      data.category,
      data.parachain_id,
      data.icon_url,
      data.description,
      data.website_url,
      data.is_active,
      new Date(data.created_at),
    );
  }

  async findById(id: string) {
    let { error, data } = await this.supabase
      .getClient()
      .from('defi_modules')
      .select('*, defi_module_actions(*, defi_pairs(*))')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch DefiModule: ${error.message}`);

    return data;
  }
}
