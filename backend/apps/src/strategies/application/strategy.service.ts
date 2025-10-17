import { Injectable } from '@nestjs/common';
import { StrategiesRepository } from '../domain/strategies.repository';
import { Strategy } from '../domain/strategies.entity';
import { title } from 'process';
import { STRATEGY_LIST } from './strategy-list';
import { simulateGDOTStrategy } from '../infrastructure/strategy-simulate/gDOT-looping-simulate';
import { calculateAPY } from '../infrastructure/rewards/get-apy';

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

  async simulateStrategy(strategyId: string, assetIn: string, amountIn: number, iterations: number = 3) {
    const strategy = await this.findById(strategyId);  
    if (strategy.strategistName === STRATEGY_LIST.gDOT_LOOPING) {
      return await simulateGDOTStrategy(assetIn, amountIn, iterations);
    }
    throw new Error('Strategy not found');
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
  async reloadAllAPY(): Promise<void> {
    const strategies = await this.strategiesRepo.findAll();

    if (!strategies || strategies.length === 0) {
      return;
    }

    await Promise.all(
      strategies.map(async (strategy) => {
    try {
      const result = await calculateAPY();
      strategy.update({ apy: result.apy });
      await this.strategiesRepo.save(strategy);
      console.log(`Updated APY for ${strategy.strategistName} (ID: ${strategy.id}) = ${result.apy}`);
    } catch (err: any) {
      console.error(`Error updating APY for strategy ID ${strategy.id}:`, err.message);
    }
  })
);

  }
}



