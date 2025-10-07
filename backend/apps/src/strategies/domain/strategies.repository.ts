
import { Strategy } from './strategies.entity';

export abstract class StrategiesRepository {
  abstract findById(id: string): Promise<Strategy | null>;
  abstract findAll(): Promise<Strategy[]>;
  abstract save(strategy: Strategy): Promise<void>;
  abstract deleteById(id: string): Promise<void>;
}


