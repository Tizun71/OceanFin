
import { Strategy } from './strategies.entity';

export abstract class StrategiesRepository {
  abstract findById(id: string): Promise<Strategy | null>;
  abstract findAll(sortBy?: string, order?: 'asc' | 'desc', limit?: number): Promise<Strategy[]>;
  abstract findAllWithFilters(params: {
    keyword?: string;
    tags?: string[];
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
  }): Promise<{ data: Strategy[]; total: number }>;
  abstract save(strategy: Strategy): Promise<void>;
  abstract deleteById(id: string): Promise<void>;
}


