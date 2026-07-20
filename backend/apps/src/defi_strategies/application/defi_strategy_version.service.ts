import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { DefiStrategyVersion } from "../domain/defi_strategy_version.entity";
import { CreateDefiStrategyVersionDto } from "../interfaces/dto/create_defi_strategy_version.dto";
import { UpdateDefiStrategyVersionDto } from "../interfaces/dto/update_defi_strategy_version.dto";
import { DefiStrategyVersionRepository } from "../domain/defi_strategy_version.repository";
import { PostgresService } from "src/shared/infrastructure/postgres.service";

@Injectable()
export class DefiStrategyVersionService {
  constructor(
    private readonly defiStrategyVersionRepository: DefiStrategyVersionRepository,
    private readonly db: PostgresService,
  ) {}

  public async getNextVersionNumber(strategy_id: string) {
    const row = await this.db.queryOne<{ version: number }>(
      `SELECT version FROM defi_strategy_versions
       WHERE strategy_id = $1 ORDER BY version DESC LIMIT 1`,
      [strategy_id],
    );

    if (!row) {
      return 1;
    }

    return row.version + 1;
  }

  public async createStrategyVersion(
    data: CreateDefiStrategyVersionDto,
  ): Promise<DefiStrategyVersion> {
    const versionNumber = await this.getNextVersionNumber(data.strategy_id);

    return this.defiStrategyVersionRepository.save(
      new DefiStrategyVersion(
        uuidv4(),
        data.strategy_id,
        versionNumber,
        data.workflow_json,
        new Date(),
        data.workflow_graph,
      ),
    );
  }

  public async update(
    id: string,
    data: UpdateDefiStrategyVersionDto,
  ): Promise<DefiStrategyVersion> {
    return this.defiStrategyVersionRepository.update(id, {
      workflow_json: data.workflow_json,
      workflow_graph: data.workflow_graph,
    });
  }

  public async delete(id: string): Promise<void> {
    await this.defiStrategyVersionRepository.delete(id);
  }

  public async getByStrategyId(strategy_id: string): Promise<DefiStrategyVersion[]> {
    return this.defiStrategyVersionRepository.getByStrategyId(strategy_id);
  }

  public async getById(id: string): Promise<DefiStrategyVersion | null> {
    return this.defiStrategyVersionRepository.getById(id);
  }
}
