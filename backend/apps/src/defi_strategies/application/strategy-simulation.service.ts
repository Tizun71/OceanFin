import { Injectable, NotFoundException } from '@nestjs/common';
import { DefiStrategiesRepository } from '../domain/defi_strategies.repository';
import {
  SimulationContext,
  SimulationEngine,
  SimulationStepDto,
  SimulationStepResult,
} from '../domain/simulation-engine.interface';
import { SwapSimulator } from './simulators/swap-simulator';
import { JoinStrategySimulator } from './simulators/join-strategy-simulator';
import { BorrowSimulator } from './simulators/borrow-simulator';
import { SupplySimulator } from './simulators/supply-simulator';
import { EnableEModeSimulator } from './simulators/enable-e-mode-simulator';
import { SimulationResultDto } from '../interfaces/dtos/simulation-result.dto';
import { DefiStrategyVersionService } from './defi_strategy_version.service';
import { EvmWorkflowSimulationService } from 'src/strategies/application/evm-workflow-simulation.service';

/** chain_context label (set by the builder from activeChain.name) -> EVM chainId. */
const CHAIN_CONTEXT_TO_ID: Record<string, number> = {
  avalanche: 43114,
  base: 8453,
  arbitrum: 42161,
};

/** A step touching an on-chain 0x address means the strategy runs on an EVM rail. */
function isEvmWorkflow(workflow: any): boolean {
  const steps = workflow?.steps ?? [];
  return steps.some(
    (s: any) =>
      String(s?.tokenIn?.address ?? '').startsWith('0x') ||
      String(s?.tokenOut?.address ?? '').startsWith('0x'),
  );
}

@Injectable()
export class StrategySimulationService implements SimulationEngine {
  private simulators: Map<string, any>;

  constructor(
    private readonly strategiesRepository: DefiStrategiesRepository,
    private readonly strategyVersionService: DefiStrategyVersionService,
    private readonly swapSimulator: SwapSimulator,
    private readonly joinStrategySimulator: JoinStrategySimulator,
    private readonly borrowSimulator: BorrowSimulator,
    private readonly supplySimulator: SupplySimulator,
    private readonly enableEModeSimulator: EnableEModeSimulator,
    private readonly evmSimulation: EvmWorkflowSimulationService,
  ) {
    this.simulators = new Map([
      ['SWAP', this.swapSimulator],
      ['JOIN_STRATEGY', this.joinStrategySimulator],
      ['BORROW', this.borrowSimulator],
      ['SUPPLY', this.supplySimulator],
      ['ENABLE_E_MODE', this.enableEModeSimulator],
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

    if (!strategy.current_version_id) {
      throw new NotFoundException(
        `Strategy with id ${strategy_id} has no current version`,
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

    const workflow_json: any = version.workflow_json;

    // EVM strategies (Aave/Benqi/Trader Joe on Avalanche etc.) price legs via the
    // Aave oracle + Trader Joe quoter, not the Hydration SDK. The builder stores
    // no chainId on the workflow, so derive it from the strategy's chain_context.
    if (isEvmWorkflow(workflow_json)) {
      const chainId = CHAIN_CONTEXT_TO_ID[String(strategy.chain_context ?? '').toLowerCase()];
      if (!chainId) {
        throw new NotFoundException(
          `Unsupported EVM chain_context "${strategy.chain_context}" for strategy ${strategy_id}`,
        );
      }
      return this.evmSimulation.simulate({ ...workflow_json, chainId }, amount_in);
    }

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
    console.log('Starting simulation with workflow:', JSON.stringify(workflow_json, null, 2));
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
          // Carry EVM execution metadata through from the source workflow step;
          // the simulators only compute amounts/apy and drop address/protocol.
          protocol: step.protocol,
          tokenIn: {
            assetId: result.token_in.asset_id,
            symbol: result.token_in.symbol,
            amount: Math.floor(result.token_in.amount * 100000) / 100000,
            address: step.tokenIn?.address,
            decimals: step.tokenIn?.decimals,
          },
          tokenOut: {
            assetId: result.token_out.asset_id,
            symbol: result.token_out.symbol,
            amount: Math.floor(result.token_out.amount * 100000) / 100000,
            address: step.tokenOut?.address,
            decimals: step.tokenOut?.decimals,
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
