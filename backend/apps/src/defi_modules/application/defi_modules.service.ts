import { Injectable, NotFoundException } from '@nestjs/common';
import { DefiModulesRepository } from '../domain/defi_modules.repository';
import { DefiModule } from '../domain/defi_modules.entity';
import { randomUUID } from 'crypto';
import { DefiModuleAction } from '../domain/defi_module_actions.entity';

@Injectable()
export class DefiModulesService {
  constructor(private readonly defiModulesRepository: DefiModulesRepository) {}

  public async create(dto: {
    name: string;
    protocol: string;
    category: string;
    parachain_id: number;
    icon_url: string;
    description: string;
    website_url: string;
    is_active: boolean;
  }) {
    return this.defiModulesRepository.save(
      new DefiModule(
        this.generateId(),
        dto.name,
        dto.protocol,
        dto.category,
        dto.parachain_id,
        dto.icon_url,
        dto.description,
        dto.website_url,
        dto.is_active,
        new Date(),
      ),
    );
  }

  public async getById(
    id: string,
  ): Promise<DefiModule & { actions: DefiModuleAction[] }> {
    const defiModule = await this.defiModulesRepository.findById(id);
    if (!defiModule) {
      throw new NotFoundException(`DefiModule with id ${id} not found`);
    }
    return defiModule;
  }

  public async getAll(
    sortBy?: string,
    order?: 'asc' | 'desc',
    limit?: number,
    page?: number,
  ): Promise<{
    total: number;
    data: (DefiModule & { actions: DefiModuleAction[] })[];
  }> {
    return this.defiModulesRepository.findAll(
      sortBy,
      order,
      limit || 10,
      page || 1,
    );
  }

  public generateId(): string {
    return randomUUID();
  }
}
