import { DefiStrategy } from './defi_strategies.entity';

export abstract class DefiStrategiesRepository {
  abstract save(defiStrategy: DefiStrategy): Promise<DefiStrategy>;
  abstract getById(id: string): Promise<DefiStrategy | null>;
  abstract getAll(owner_id?: string): Promise<DefiStrategy[]>;
  abstract update(
    id: string,
    defiStrategy: Partial<DefiStrategy>,
  ): Promise<DefiStrategy>;
  abstract delete(id: string): Promise<void>;
}
