import { DefiModule } from './defi_modules.entity';

export abstract class DefiModulesRepository {
  abstract save(defiModule: DefiModule): Promise<void>;
  abstract findById(id: string): Promise<DefiModule | null>;
  abstract findAll(
    sortBy?: string,
    order?: 'asc' | 'desc',
    limit?: number,
    page?: number,
  ): Promise<{ total: number; data: DefiModule[] }>;
}
