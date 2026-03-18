import { Injectable } from '@nestjs/common';
import { StrategyParserService } from './strategy-parser.service';
import { StrategyValidatorService } from './strategy-validator.service';
import { GeminiAiService } from './gemini-ai.service';
import { StrategySimulationService } from '../../strategies/application/strategy-simulation.service';
import { BuildStrategyDto } from '../interfaces/dtos/build-strategy.dto';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';

@Injectable()
export class AiStrategyBuilderService {
  constructor(
    private readonly parser: StrategyParserService,
    private readonly validator: StrategyValidatorService,
    private readonly geminiAi: GeminiAiService,
    private readonly simulationService: StrategySimulationService,
  ) {}

  async buildStrategy(dto: BuildStrategyDto): Promise<{
    steps: StrategyStepResponseDto[];
    validation: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
    metadata: {
      totalSteps: number;
      estimatedGas: number;
      riskLevel: string;
      aiGenerated: boolean;
    };
    aiAnalysis?: {
      riskFactors: string[];
      recommendations: string[];
    };
  }> {
    console.log('BuildStrategy DTO received:', {
      userIntent: dto.userIntent,
      additionalContext: dto.additionalContext,
      tokenAmount: dto.tokenAmount,
    });

    // Parse natural language to steps using Gemini AI
    const steps = await this.parser.parseNaturalLanguage(
      dto.userIntent,
      dto.additionalContext,
      dto.tokenAmount
    );

    // Simulate strategy to get accurate amounts
    const simulatedSteps = await this.simulateStrategy(steps, dto.tokenAmount || 10);

    // Validate steps against DefiPair entities
    const validation = await this.validator.validateSteps(simulatedSteps);

    // Get AI risk analysis
    let aiAnalysis;
    try {
      const riskAnalysis = await this.geminiAi.analyzeStrategyRisk(simulatedSteps);
      aiAnalysis = {
        riskFactors: riskAnalysis.riskFactors,
        recommendations: riskAnalysis.recommendations,
      };
    } catch (error) {
      console.warn('AI risk analysis failed:', error.message);
    }

    // Calculate metadata
    const metadata = {
      totalSteps: simulatedSteps.length,
      estimatedGas: this.estimateGas(simulatedSteps),
      riskLevel: aiAnalysis ? 
        (await this.geminiAi.analyzeStrategyRisk(simulatedSteps)).riskLevel : 
        this.calculateRiskLevel(simulatedSteps),
      aiGenerated: true,
    };

    return {
      steps: simulatedSteps,
      validation,
      metadata,
      aiAnalysis,
    };
  }

  private async simulateStrategy(
    steps: StrategyStepResponseDto[],
    amountIn: number
  ): Promise<StrategyStepResponseDto[]> {
    try {
      console.log('Simulating strategy with steps:', steps.length);
      
      // Detect strategy type based on steps
      const strategyType = this.detectStrategyType(steps);
      
      if (strategyType === 'GDOT_LOOPING') {
        return this.simulateGDOTStrategy(steps, amountIn);
      } else if (strategyType === 'VDOT_LOOPING') {
        return this.simulateVDOTStrategy(steps, amountIn);
      } else {
        // For other strategies, use generic simulation
        return this.simulateGenericStrategy(steps, amountIn);
      }
    } catch (error) {
      console.error('Strategy simulation failed:', error);
      // Return original steps if simulation fails
      return steps;
    }
  }

  private detectStrategyType(steps: StrategyStepResponseDto[]): string {
    const hasJoinStrategy = steps.some(step => step.type === 'JOIN_STRATEGY');
    const hasGDOT = steps.some(step => 
      step.tokenIn?.symbol === 'GDOT' || step.tokenOut?.symbol === 'GDOT'
    );
    const hasVDOT = steps.some(step => 
      step.tokenIn?.symbol === 'VDOT' || step.tokenOut?.symbol === 'VDOT'
    );
    const hasBorrow = steps.some(step => step.type === 'BORROW');
    
    if (hasJoinStrategy && hasGDOT && hasBorrow) {
      return 'GDOT_LOOPING';
    } else if (hasVDOT && hasBorrow) {
      return 'VDOT_LOOPING';
    } else {
      return 'GENERIC';
    }
  }

  private async simulateGDOTStrategy(
    steps: StrategyStepResponseDto[],
    amountIn: number
  ): Promise<StrategyStepResponseDto[]> {
    // Count iterations (JOIN_STRATEGY steps)
    const iterations = steps.filter(step => step.type === 'JOIN_STRATEGY').length;
    
    // Get input token from first step (skip ENABLE_E_MODE)
    const firstStepWithToken = steps.find(step => 
      step.type !== 'ENABLE_E_MODE' && step.tokenIn?.assetId
    );
    const assetInId = firstStepWithToken?.tokenIn?.assetId || '5'; // Default to DOT
    
    console.log(`Simulating GDOT strategy: assetId=${assetInId}, amount=${amountIn}, iterations=${iterations}`);
    
    // Use simulation service
    const simulationResult = await this.simulationService.simulateGdot(
      assetInId,
      amountIn,
      iterations
    );
    
    // Update steps with simulated amounts
    return this.updateStepsWithSimulation(steps, simulationResult);
  }

  private async simulateVDOTStrategy(
    steps: StrategyStepResponseDto[],
    amountIn: number
  ): Promise<StrategyStepResponseDto[]> {
    // Count iterations (SWAP DOT->VDOT steps)
    const iterations = steps.filter(step => 
      step.type === 'SWAP' && 
      step.tokenIn?.symbol === 'DOT' && 
      step.tokenOut?.symbol === 'VDOT'
    ).length;
    
    // Get input token from first step
    const firstStepWithToken = steps.find(step => 
      step.type !== 'ENABLE_E_MODE' && step.tokenIn?.assetId
    );
    const assetInId = firstStepWithToken?.tokenIn?.assetId || '5'; // Default to DOT
    
    console.log(`Simulating VDOT strategy: assetId=${assetInId}, amount=${amountIn}, iterations=${iterations}`);
    
    // Use simulation service
    const simulationResult = await this.simulationService.simulateVdot(
      assetInId,
      amountIn,
      iterations
    );
    
    // Update steps with simulated amounts
    return this.updateStepsWithSimulation(steps, simulationResult);
  }

  private async simulateGenericStrategy(
    steps: StrategyStepResponseDto[],
    amountIn: number
  ): Promise<StrategyStepResponseDto[]> {
    console.log('Using generic simulation for strategy');
    
    // For generic strategies, just update the first step amount and keep ratios
    const updatedSteps = [...steps];
    let currentAmount = amountIn;
    
    for (let i = 0; i < updatedSteps.length; i++) {
      const step = updatedSteps[i];
      
      if (step.type === 'ENABLE_E_MODE') {
        continue; // Skip E-Mode steps
      }
      
      if (step.tokenIn) {
        step.tokenIn.amount = Number(currentAmount.toFixed(6));
      }
      
      if (step.tokenOut) {
        // Apply simple conversion rates
        if (step.type === 'SWAP') {
          currentAmount = this.applySwapRate(
            step.tokenIn?.symbol || 'DOT',
            step.tokenOut.symbol,
            currentAmount
          );
        } else if (step.type === 'JOIN_STRATEGY') {
          currentAmount = currentAmount * 0.929; // GDOT rate
        } else if (step.type === 'BORROW') {
          currentAmount = currentAmount * 0.9; // 90% LTV
        }
        
        step.tokenOut.amount = Number(currentAmount.toFixed(6));
      }
    }
    
    return updatedSteps;
  }

  private updateStepsWithSimulation(
    steps: StrategyStepResponseDto[],
    simulationResult: any
  ): StrategyStepResponseDto[] {
    console.log('Updating steps with simulation result:', simulationResult);
    
    // If simulation service returns detailed step-by-step results
    if (simulationResult && simulationResult.steps) {
      return this.mapSimulationToSteps(steps, simulationResult.steps);
    }
    
    // If simulation service returns summary data
    if (simulationResult && simulationResult.totalSupplied) {
      return this.updateStepsWithSummary(steps, simulationResult);
    }
    
    // Fallback: return original steps
    return steps;
  }

  private mapSimulationToSteps(
    originalSteps: StrategyStepResponseDto[],
    simulationSteps: any[]
  ): StrategyStepResponseDto[] {
    const updatedSteps = [...originalSteps];
    
    // Map simulation results to original steps
    let simIndex = 0;
    for (let i = 0; i < updatedSteps.length; i++) {
      const step = updatedSteps[i];
      
      if (step.type === 'ENABLE_E_MODE') {
        continue; // Skip E-Mode steps
      }
      
      if (simIndex < simulationSteps.length) {
        const simStep = simulationSteps[simIndex];
        
        if (step.tokenIn && simStep.amountIn) {
          step.tokenIn.amount = Number(Number(simStep.amountIn).toFixed(6));
        }
        
        if (step.tokenOut && simStep.amountOut) {
          step.tokenOut.amount = Number(Number(simStep.amountOut).toFixed(6));
        }
        
        simIndex++;
      }
    }
    
    return updatedSteps;
  }

  private updateStepsWithSummary(
    steps: StrategyStepResponseDto[],
    summary: any
  ): StrategyStepResponseDto[] {
    console.log('Updating steps with summary:', summary);
    
    // Update steps based on summary data
    const updatedSteps = [...steps];
    
    // Update amounts based on simulation summary
    if (summary.totalSupplied) {
      const supplySteps = updatedSteps.filter(step => step.type === 'SUPPLY');
      supplySteps.forEach((step, index) => {
        if (step.tokenIn) {
          step.tokenIn.amount = Number((summary.totalSupplied / supplySteps.length).toFixed(6));
        }
      });
    }
    
    if (summary.totalBorrowed) {
      const borrowSteps = updatedSteps.filter(step => step.type === 'BORROW');
      borrowSteps.forEach((step, index) => {
        if (step.tokenOut) {
          step.tokenOut.amount = Number((summary.totalBorrowed / borrowSteps.length).toFixed(6));
        }
      });
    }
    
    return updatedSteps;
  }

  private applySwapRate(tokenIn: string, tokenOut: string, amountIn: number): number {
    // Simple conversion rates
    const rates: { [key: string]: number } = {
      'DOT_VDOT': 0.95,
      'DOT_GDOT': 0.929,
      'VDOT_DOT': 1.05,
      'GDOT_DOT': 1.076,
      'DOT_USDC': 6.67,
      'USDC_DOT': 0.15,
      'DOT_USDT': 6.67,
      'USDT_DOT': 0.15,
    };
    
    const rateKey = `${tokenIn}_${tokenOut}`;
    const rate = rates[rateKey] || 0.98; // Default 2% slippage
    
    return amountIn * rate;
  }

  private estimateGas(steps: StrategyStepResponseDto[]): number {
    // Base gas per step type
    const gasEstimates = {
      ENABLE_E_MODE: 50000,
      SWAP: 150000,
      SUPPLY: 100000,
      BORROW: 120000,
      JOIN_STRATEGY: 180000,
      BRIDGE: 200000,
      STAKE: 100000,
      UNSTAKE: 100000,
      CLAIM_REWARDS: 80000,
    };

    return steps.reduce((total, step) => {
      return total + (gasEstimates[step.type] || 100000);
    }, 0);
  }

  private calculateRiskLevel(steps: StrategyStepResponseDto[]): string {
    const borrowSteps = steps.filter((s) => s.type === 'BORROW').length;
    const totalSteps = steps.length;

    if (borrowSteps === 0) return 'LOW';
    if (borrowSteps / totalSteps > 0.4) return 'HIGH';
    return 'MEDIUM';
  }
}