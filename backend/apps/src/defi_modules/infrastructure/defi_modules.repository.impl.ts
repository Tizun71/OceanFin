import { Injectable } from '@nestjs/common';
import { DefiModulesRepository } from '../domain/defi_modules.repository';
import { DefiModule } from '../domain/defi_modules.entity';
import { SupabaseService } from 'src/shared/infrastructure/supabase.service';

@Injectable()
export class DefiModulesRepositoryImplement implements DefiModulesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findById(id: string): Promise<DefiModule | null> {
    const { error, data } = await this.supabase
      .getClient()
      .from('defi_modules')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapRowToEntity(data);
  }

  async findAll(
    sortBy?: string,
    order?: 'asc' | 'desc',
    limit?: number,
    page?: number,
  ): Promise<{ total: number; data: DefiModule[] }> {
    let query = this.supabase
      .getClient()
      .from('defi_modules')
      .select('*', { count: 'exact' });

    if (sortBy) {
      query = query.order(sortBy, { ascending: order === 'asc' });
    }

    if (page && limit) {
      query = query.range((page - 1) * limit, page * limit - 1);
    }

    const { error, data, count } = await query;

    if (error) throw new Error(`Failed to fetch DefiModules: ${error.message}`);

    return {
      total: count ?? 0,
      data: data.map((row) => this.mapRowToEntity(row)),
    };
  }

  async save(defiModule: DefiModule): Promise<void> {
    const { error } = await this.supabase
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
      });

    if (error) {
      throw new Error(`Failed to save DefiModule: ${error.message}`);
    }
  }

  private mapRowToEntity(row: any): DefiModule {
    return new DefiModule(
      row.id,
      row.name,
      row.protocol,
      row.category,
      row.parachain_id,
      row.icon_url,
      row.description,
      row.website_url,
      row.is_active,
      row.created_at,
    );
  }
}
