import { Injectable, NotFoundException } from '@nestjs/common';
import { DefiModulesRepository } from '../domain/defi_modules.repository';
import { DefiModule } from '../domain/defi_modules.entity';
import { DefiModuleAction } from '../domain/defi_module_actions.entity';
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class DefiModulesService {
  constructor(private readonly defiModulesRepository: DefiModulesRepository) { }

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
        uuidv4(),
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

  public async getAll() {
    return this.defiModulesRepository.findAll();
  }

  public async getById(id: string) {
    const module = await this.defiModulesRepository.findById(id);
    if (!module) throw new NotFoundException('DefiModule not found');
    return module;
  }
}
