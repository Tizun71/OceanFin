import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { DefiStrategyVersion } from "../domain/defi_strategy_version.entity";
import { CreateDefiStrategyVersionDto } from "../interfaces/dto/create_defi_strategy_version.dto";
import { UpdateDefiStrategyVersionDto } from "../interfaces/dto/update_defi_strategy_version.dto";
import { DefiStrategyVersionRepository } from "../domain/defi_strategy_version.repository";
import { SupabaseService } from "src/shared/infrastructure/supabase.service";

@Injectable()
export class DefiStrategyVersionService {
  constructor(
    private readonly defiStrategyVersionRepository: DefiStrategyVersionRepository,
    private readonly supabase: SupabaseService,
  ) {}

  public async getNextVersionNumber(strategy_id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from("defi_strategy_versions")
      .select("version")
      .eq("strategy_id", strategy_id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch latest version: ${error.message}`);
    }

    if (!data) {
      return 1;
    }

    return data.version + 1;
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
