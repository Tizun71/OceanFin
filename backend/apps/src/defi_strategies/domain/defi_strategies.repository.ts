import { DefiStrategy } from './defi_strategies.entity';

export abstract class DefiStrategiesRepository {
  abstract save(defiStrategy: DefiStrategy): Promise<DefiStrategy>;
}
