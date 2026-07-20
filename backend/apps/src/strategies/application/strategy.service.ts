import { Injectable } from '@nestjs/common';
import { StrategiesRepository } from '../domain/strategies.repository';
import { Strategy } from '../domain/strategies.entity';
import { title } from 'process';
import { STRATEGY_LIST } from './strategy-list';
import { RewardsService } from './rewards.service';
import { HydrationStrategyService } from './hydration-strategy.service';
import { StrategySimulationService } from './strategy-simulation.service';
import { StrategyMapper } from './mappers/strategy.mapper';
import { AvalancheApyService } from './avalanche-apy.service';
import { EvmWorkflowSimulationService } from './evm-workflow-simulation.service';
import { DefiStrategiesService } from '../../defi_strategies/application/defi_strategies.service';
import { DefiStrategyVersionService } from '../../defi_strategies/application/defi_strategy_version.service';

@Injectable()
export class StrategyService {
  constructor(
    private readonly strategiesRepo: StrategiesRepository,
    private readonly hydrationStrategy: HydrationStrategyService,
    private readonly rewards: RewardsService,
    private readonly simulation: StrategySimulationService,
    private readonly avalancheApy: AvalancheApyService,
    private readonly evmSimulation: EvmWorkflowSimulationService,
    private readonly defiStrategies: DefiStrategiesService,
    private readonly defiStrategyVersions: DefiStrategyVersionService,
  ) { }

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

  async findAll(sortBy?: string, order: 'asc' | 'desc' = 'desc', limit?: number): Promise<Strategy[]> {
    return this.strategiesRepo.findAll(sortBy, order, limit);
  }

  async findAllWithFilters(params: {
    keyword?: string;
    tags?: string[];
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
  }) {
    const { data, total } = await this.strategiesRepo.findAllWithFilters(params);

    const filters: any = {};
    if (params.keyword) filters.keyword = params.keyword;
    if (params.tags?.length) filters.tags = params.tags;

    return {
      filters,
      activeFiltersCount: Object.keys(filters).length,
      data: data.map(s => StrategyMapper.toResponse(s)),
      meta: { total, limit: params.limit },
    };
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
      return await this.simulation.simulateGdot(assetIn, amountIn, iterations);
    }
    if (strategy.strategistName === STRATEGY_LIST.vDOT_LOOPING) {
      return await this.simulation.simulateVdot(assetIn, amountIn, iterations);
    }

    // EVM strategies are backed by a seeded workflow sharing this row's id;
    // simulation walks that workflow instead of a hand-written Hydration script.
    const workflow = await this.findEvmWorkflow(strategyId);
    if (workflow) {
      return await this.evmSimulation.simulate(workflow, amountIn);
    }

    throw new Error(`No simulator for strategy ${strategy.strategistName}`);
  }

  /**
   * The marketplace row and its executable workflow share an id (see
   * seeds/0003-strategies.sql and 0004-defi-strategies.sql). Returns null when a
   * strategy has no workflow, so callers can fall back.
   */
  private async findEvmWorkflow(strategyId: string): Promise<any | null> {
    const defiStrategy = await this.defiStrategies.getById(strategyId).catch(() => null);
    if (!defiStrategy?.current_version_id) return null;

    const version = await this.defiStrategyVersions
      .getById(defiStrategy.current_version_id)
      .catch(() => null);

    return version?.workflow_json ?? null;
  }

  /**
   * Input token of a strategy, read from the first step of its workflow.
   * `strategies.assets` holds icon paths, not symbols, so it cannot be used.
   */
  async getInputAsset(
    strategyId: string,
  ): Promise<{ symbol: string; address?: string; decimals?: number; chain?: string } | null> {
    const workflow = await this.findEvmWorkflow(strategyId);
    // A workflow can open with ENABLE_E_MODE, which carries no token — take the
    // first step that actually moves one.
    const token = workflow?.steps?.find((s: any) => s?.tokenIn?.symbol)?.tokenIn;
    if (!token?.symbol) return null;

    return {
      symbol: token.symbol,
      address: token.address,
      decimals: token.decimals,
      chain: workflow?.chain,
    };
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
          const result = this.avalancheApy.supports(strategy.strategistName)
            ? await this.avalancheApy.calculateApy(strategy.strategistName)
            : await this.rewards.calculateAPY(strategy.strategistName);
          console.log(result);
          strategy.update({ apy: result.apy });
          await this.strategiesRepo.save(strategy);
        } catch (err: any) {
          console.error(`Error updating APY for strategy ID ${strategy.id}:`, err.message);
        }
      })
    );

  }
}



