import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DefiStrategiesRepository } from '../domain/defi_strategies.repository';
import {
  SimulationContext,
  SimulationEngine,
  SimulationStepDto,
  SimulationStepResult,
} from '../domain/simulation-engine.interface';
import { SwapSimulator } from './simulators/swap-simulator';
import { BridgeSimulator } from './simulators/bridge-simulator';
import { StakeSimulator } from './simulators/stake-simulator';
import { JoinStrategySimulator } from './simulators/join-strategy-simulator';
import { BorrowSimulator } from './simulators/borrow-simulator';
import { SupplySimulator } from './simulators/supply-simulator';
import { EnableEModeSimulator } from './simulators/enable-e-mode-simulator';
import { EnableBorrowingSimulator } from './simulators/enable-borrowing-simulator';
import { SimulationResultDto } from '../interfaces/dtos/simulation-result.dto';
import { DefiStrategyVersionService } from './defi_strategy_version.service';

@Injectable()
export class StrategySimulationService implements SimulationEngine {
  private simulators: Map<string, any>;

  constructor(
    private readonly strategiesRepository: DefiStrategiesRepository,
    private readonly strategyVersionService: DefiStrategyVersionService,
    private readonly swapSimulator: SwapSimulator,
    private readonly bridgeSimulator: BridgeSimulator,
    private readonly stakeSimulator: StakeSimulator,
    private readonly joinStrategySimulator: JoinStrategySimulator,
    private readonly borrowSimulator: BorrowSimulator,
    private readonly supplySimulator: SupplySimulator,
    private readonly enableEModeSimulator: EnableEModeSimulator,
    private readonly enableBorrowingSimulator: EnableBorrowingSimulator,
  ) {
    this.simulators = new Map([
      ['SWAP', this.swapSimulator],
      ['BRIDGE', this.bridgeSimulator],
      ['STAKE', this.stakeSimulator],
      ['UNSTAKE', this.stakeSimulator],
      ['JOIN_STRATEGY', this.joinStrategySimulator],
      ['BORROW', this.borrowSimulator],
      ['SUPPLY', this.supplySimulator],
      ['ENABLE_E_MODE', this.enableEModeSimulator],
      ['ENABLE_BORROWING', this.enableBorrowingSimulator],
    ]);
  }

  async simulateStrategy(
    strategy_id: string,
    amount_in: number,
    options?: {
      slippage_tolerance?: number;
      gas_price?: number;
    },
  ) {
    const strategy = await this.strategiesRepository.getById(strategy_id);

    if (!strategy) {
      throw new NotFoundException(
        `Strategy with id ${strategy_id} not found`,
      );
    }

    const version = await this.strategyVersionService.getById(
      strategy.current_version_id,
    );

    if (!version) {
      throw new NotFoundException(
        `Strategy version with id ${strategy.current_version_id} not found`,
      );
    }

    const workflow_json = version.workflow_json;

    const result = await this.simulate(workflow_json, amount_in, options);

    return result;
  }

  async simulate(
    workflow_json: any,
    amount_in: number,
    options?: {
      slippage_tolerance?: number;
      gas_price?: number;
    },
  ) {
    if (!workflow_json || !workflow_json.steps || !Array.isArray(workflow_json.steps)) {
      throw new Error('Invalid workflow_json: missing or invalid steps array');
    }

    const context: SimulationContext = {
      amount_in,
      slippage_tolerance: options?.slippage_tolerance || 0.5,
      gas_price: options?.gas_price,
      current_amount: amount_in,
      total_fee: 0,
      warnings: [],
    };

    const steps: SimulationStepDto[] = [];

    const workflow = workflow_json.steps ? workflow_json.steps : workflow_json;

    for (const step of workflow) {
      if (!step.type) {
        throw new Error(`Step is missing 'type' property: ${JSON.stringify(step)}`);
      }

      const simulator = this.getSimulator(step.type);

      if (!simulator) {
        throw new Error(
          `No simulator found for action type: ${step.type}. Available types: ${Array.from(this.simulators.keys()).join(', ')}`,
        );
      }

      try {
        const result = await simulator.simulate(step, context);
        steps.push({
          step: result.step_index,
          type: result.action_type,
          agent: result.agent,
          tokenIn: {
            assetId: result.token_in.asset_id,
            symbol: result.token_in.symbol,
            amount: Math.floor(result.token_in.amount * 100000) / 100000,
          },
          tokenOut: {
            assetId: result.token_out.asset_id,
            symbol: result.token_out.symbol,
            amount: Math.floor(result.token_out.amount * 100000) / 100000,
          },
        });
      } catch (error) {
        throw new Error(
          `Failed to simulate step ${step.step || 'unknown'}: ${error.message}`,
        );
      }
    }

    return {
      initialCapital: {
        assetId: steps[0]?.tokenIn?.assetId,
        symbol: steps[0]?.tokenIn?.symbol,
        amount: amount_in,
      },
      steps,
    };
  }

  private getSimulator(actionType: string): any {
    return this.simulators.get(actionType);
  }

  registerSimulator(actionType: string, simulator: any): void {
    this.simulators.set(actionType, simulator);
  }

  transformToExecutionFormat(simulationResult: SimulationResultDto): any {
    const loops = simulationResult.steps.filter(
      (step) => step.action_type === 'JOIN_STRATEGY',
    ).length;

    const transformedSteps = simulationResult.steps.map((step, index) => {
      const baseStep: any = {
        step: index + 1,
        type: step.action_type,
        agent: step.agent,
      };

      if (step.action_type === 'BORROW') {
        baseStep.tokenOut = {
          assetId: step.token_out.asset_id,
          symbol: step.token_out.symbol,
          amount: step.token_out.amount,
        };
      } else if (step.action_type === 'ENABLE_E_MODE' || step.action_type === 'ENABLE_BORROWING') {
      } else {
        baseStep.tokenIn = {
          assetId: step.token_in.asset_id,
          symbol: step.token_in.symbol,
          amount: step.token_in.amount,
        };
        baseStep.tokenOut = {
          assetId: step.token_out.asset_id,
          symbol: step.token_out.symbol,
          amount: step.token_out.amount,
        };
      }

      return baseStep;
    });

    return {
      loops: loops.toString(),
      fee: 0,
      steps: transformedSteps,
    };
  }
}
