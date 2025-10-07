import { Injectable } from '@nestjs/common';
import { StrategiesRepository } from '../domain/strategies.repository';
import { Strategy } from '../domain/strategies.entity';

@Injectable()
export class StrategyService {
  constructor(private readonly strategiesRepo: StrategiesRepository) {}

  async create(dto: {
    strategistName: string;
    apy: number;
    tags?: string[];
    strategistHandle?: string;
    assets?: string[];
    agents?: string[];
    chains?: string[];
  }): Promise<Strategy> {
    const id = this.generateId();
    const strategy = new Strategy(
      id,
      dto.strategistName,
      dto.apy,
      dto.tags ?? [],
      dto.strategistHandle,
      dto.assets ?? [],
      dto.agents ?? [],
      dto.chains ?? [],
    );
    await this.strategiesRepo.save(strategy);
    return strategy;
  }

  async findById(id: string): Promise<Strategy> {
    const found = await this.strategiesRepo.findById(id);
    if (!found) throw new Error('Strategy not found');
    return found;
  }

  async findAll(): Promise<Strategy[]> {
    return this.strategiesRepo.findAll();
  }

  async update(
    id: string,
    fields: Partial<{
      strategistName: string;
      apy: number;
      tags: string[];
      strategistHandle?: string;
      assets: string[];
      agents: string[];
      chains: string[];
    }>,
  ): Promise<Strategy> {
    const strategy = await this.findById(id);
    strategy.update(fields);
    await this.strategiesRepo.save(strategy);
    return strategy;
  }

  async deleteById(id: string): Promise<void> {
    await this.strategiesRepo.deleteById(id);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}



