import { Injectable, NotFoundException } from '@nestjs/common';
import { DefiStrategySimulationSnapshot } from '../domain/defi_strategy_simulation_snapshot.entity';
import { DefiStrategyVersionService } from './defi_strategy_version.service';
import { DefiStrategySimulationSnapshotRepository } from '../domain/defi_strategy_simulation_snapshot.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiStrategySimulationSnapshotService {
  constructor(
    private readonly repository: DefiStrategySimulationSnapshotRepository,
    private readonly defiStrategyVersionService: DefiStrategyVersionService,
  ) {}

  async create(dto: Partial<DefiStrategySimulationSnapshot>) {
    // ensure strategy version exists
    const version = await this.defiStrategyVersionService.getById(
      dto.strategy_version_id as string,
    );

    if (!version) {
      throw new NotFoundException('Strategy version not found');
    }
    const id = uuidv4();
    const now = new Date();

    const snapshotEntity = new DefiStrategySimulationSnapshot(
      id,
      dto.strategy_version_id as string,
      dto.snapshot_type as string,
      dto.estimated_outputs as object,
      dto.estimated_weight ? BigInt(dto.estimated_weight) : BigInt(0),
      dto.estimated_fee ? BigInt(dto.estimated_fee) : BigInt(0),
      (dto.chain_state_ref as string) ?? null,
      now,
    );

    const saved = await this.repository.save(snapshotEntity);

    // ensure bigint-like fields returned as strings
    return {
      ...saved,
      estimated_weight: saved.estimated_weight?.toString?.() ?? '0',
      estimated_fee: saved.estimated_fee?.toString?.() ?? '0',
    };
  }

  async getByStrategyVersion(strategy_version_id: string) {
    return this.repository.getByStrategyVersion(strategy_version_id);
  }
}
