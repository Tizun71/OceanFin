import { Injectable, NotFoundException } from '@nestjs/common';
import { DefiModulesRepository } from '../domain/defi_modules.repository';
import { DefiModule } from '../domain/defi_modules.entity';
import { DefiModuleAction } from '../domain/defi_module_actions.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateDefiModuleDto } from '../interfaces/dtos/create_defi_module.dto';
import { DefiPair } from '../domain/defi_pairs.entity';

@Injectable()
export class DefiModulesService {
  constructor(private readonly defiModulesRepository: DefiModulesRepository) {}

  public async create(dto: CreateDefiModuleDto): Promise<DefiModule> {
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
