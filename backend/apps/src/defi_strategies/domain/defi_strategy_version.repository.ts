import { DefiStrategyVersion } from './defi_strategy_version.entity';

export abstract class DefiStrategyVersionRepository {
  abstract save(
    defiStrategyVersion: DefiStrategyVersion,
  ): Promise<DefiStrategyVersion>;
  abstract update(
    id: string,
    updates: Partial<DefiStrategyVersion>,
  ): Promise<DefiStrategyVersion>;
  abstract delete(id: string): Promise<void>;
  abstract getByStrategyId(strategy_id: string): Promise<DefiStrategyVersion[]>;
}
