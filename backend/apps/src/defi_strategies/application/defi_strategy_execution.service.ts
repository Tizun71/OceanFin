import { Injectable, NotFoundException } from "@nestjs/common";
import { DefiStrategyExecution } from "../domain/defi_strategy_execution.entity";
import { DefiStrategyExecutionRepository } from "../domain/defi_strategy_execution.repository";
import { DefiStrategyVersionService } from "./defi_strategy_version.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class DefiStrategyExecutionService {
  constructor(
    private readonly repository: DefiStrategyExecutionRepository,
    private readonly versionService: DefiStrategyVersionService,
  ) {}

  async create(data: Partial<DefiStrategyExecution>) {
    // ensure strategy version exists
    const version = await this.versionService.getById(data.strategy_version_id as string);

    if (!version) throw new NotFoundException("Strategy version not found");

    const id = uuidv4();
    const now = new Date();

    const execution = new DefiStrategyExecution(
      id,
      data.strategy_version_id as string,
      data.extrinsic_hash as string,
      data.execution_status as string,
      now,
    );

    return this.repository.save(execution);
  }

  async getByStrategyVersion(strategy_version_id: string) {
    return this.repository.getByStrategyVersion(strategy_version_id);
  }

  async update(id: string, updates: Partial<DefiStrategyExecution>) {
    return this.repository.update(id, updates);
  }
}
