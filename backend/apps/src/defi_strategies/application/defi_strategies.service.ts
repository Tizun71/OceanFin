import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DefiStrategiesRepository } from '../domain/defi_strategies.repository';
import { DefiStrategy } from '../domain/defi_strategies.entity';
import { DefiStrategyVersionService } from './defi_strategy_version.service';
import { CreateDefiStrategyDto } from '../interfaces/dto/create_defi_strategy.dto';
import { UpdateDefiStrategyDto } from '../interfaces/dto/update_defi_strategy.dto';
import { UserService } from '../../users/application/user.service';

@Injectable()
export class DefiStrategiesService {
  constructor(
    private readonly defiStrategiesRepository: DefiStrategiesRepository,
    private readonly defiStrategyVersionService: DefiStrategyVersionService,
    private readonly userService: UserService,
  ) {}

  public async create(data: CreateDefiStrategyDto): Promise<DefiStrategy> {
    const strategy_id = uuidv4();

    const strategy = await this.defiStrategiesRepository.save(
      new DefiStrategy(
        strategy_id,
        data.owner_id,
        data.name,
        data.description,
        data.status,
        data.is_public,
        data.chain_context,
        '',
        new Date(),
      ),
    );

    const strategyVersion =
      await this.defiStrategyVersionService.createStrategyVersion({
        strategy_id,
        workflow_json: data.workflow_json,
        workflow_graph: data.workflow_graph,
      });

    strategy.current_version_id = strategyVersion.id;

    return this.defiStrategiesRepository.save(strategy);
  }

  public async getAll(owner_id?: string) {
    if (owner_id) {
      await this.userService.getUser(owner_id);
    }

    const strategies = await this.defiStrategiesRepository.getAll(owner_id);

    return strategies;
  }

  public async update(
    id: string,
    data: UpdateDefiStrategyDto,
  ): Promise<DefiStrategy> {
    const updated = await this.defiStrategiesRepository.update(id, {
      name: data.name,
      description: data.description,
      status: data.status,
      is_public: data.is_public,
      chain_context: data.chain_context,
    });

    if (!updated) {
      throw new NotFoundException(`DefiStrategy with id ${id} not found`);
    }

    return updated;
  }

  public async delete(id: string): Promise<void> {
    await this.defiStrategiesRepository.delete(id);
  }
}
