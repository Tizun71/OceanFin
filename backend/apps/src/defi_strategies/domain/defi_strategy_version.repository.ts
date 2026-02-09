import { DefiStrategyVersion } from './defi_strategy_version.entity';

export abstract class DefiStrategyVersionRepository {
  abstract save(
    defiStrategyVersion: DefiStrategyVersion,
  ): Promise<DefiStrategyVersion>;
}
