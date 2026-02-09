import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DefiStrategiesRepository } from '../domain/defi_strategies.repository';
import { DefiStrategy } from '../domain/defi_strategies.entity';
import { DefiStrategyVersionService } from './defi_strategy_version.service';
import { CreateDefiStrategyDto } from '../interfaces/dto/create_defi_strategy.dto';
import { DefiUsersService } from '../../defi_users/application/defi_users.service';

@Injectable()
export class DefiStrategiesService {
  constructor(
    private readonly defiStrategiesRepository: DefiStrategiesRepository,
    private readonly defiStrategyVersionService: DefiStrategyVersionService,
    private readonly defiUsersService: DefiUsersService,
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
        workflow_hash: data.workflow_hash,
      });

    strategy.current_version_id = strategyVersion.id;

    return this.defiStrategiesRepository.save(strategy);
  }

  public async getByOwnerId(owner_id: string) {
    await this.defiUsersService.getDefiUserById(owner_id);
    const strategies =
      await this.defiStrategiesRepository.getByOwnerId(owner_id);

    return strategies;
  }
}
