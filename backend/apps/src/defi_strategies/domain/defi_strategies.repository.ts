import { DefiStrategy } from './defi_strategies.entity';

export abstract class DefiStrategiesRepository {
  abstract save(defiStrategy: DefiStrategy): Promise<DefiStrategy>;
  abstract getByOwnerId(owner_id: string): Promise<DefiStrategy[]>;
  abstract update(
    id: string,
    defiStrategy: Partial<DefiStrategy>,
  ): Promise<DefiStrategy>;
  abstract delete(id: string): Promise<void>;
}
