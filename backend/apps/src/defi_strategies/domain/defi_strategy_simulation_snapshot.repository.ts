import { DefiStrategySimulationSnapshot } from './defi_strategy_simulation_snapshot.entity';

export abstract class DefiStrategySimulationSnapshotRepository {
  abstract save(
    snapshot: DefiStrategySimulationSnapshot,
  ): Promise<DefiStrategySimulationSnapshot | any>;

  abstract getByStrategyVersion(
    strategy_version_id: string,
  ): Promise<(DefiStrategySimulationSnapshot | any)[]>;

  abstract getById(
    id: string,
  ): Promise<DefiStrategySimulationSnapshot | any | null>;
}
