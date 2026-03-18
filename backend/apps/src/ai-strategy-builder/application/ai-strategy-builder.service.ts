import { Injectable, Logger } from '@nestjs/common';
import { StrategyParserService } from './strategy-parser.service';
import { StrategyValidatorService } from './strategy-validator.service';
import { GeminiAiService } from './gemini-ai.service';
import { StrategySimulationService as DefiSimulationService } from '../../defi_strategies/application/strategy-simulation.service';
import { BuildStrategyDto } from '../interfaces/dtos/build-strategy.dto';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';

/**
 * Service responsible for building DeFi strategies using AI-powered natural language processing.
 * 
 * This service orchestrates the entire strategy building process:
 * 1. Parses natural language input into structured strategy steps
 * 2. Simulates strategy execution to calculate accurate amounts
 * 3. Validates steps against available DeFi pairs
 * 4. Provides risk analysis and recommendations
 * 
 * @example
 * ```typescript
 * const strategy = await aiStrategyBuilder.buildStrategy({
 *   userIntent: "Create a GDOT looping strategy with 10 DOT",
 *   tokenAmount: 10
 * });
 * ```
 */
@Injectable()
export class AiStrategyBuilderService {

  constructor(
    private readonly parser: StrategyParserService,
    private readonly validator: StrategyValidatorService,
    private readonly geminiAi: GeminiAiService,
    private readonly defiSimulationService: DefiSimulationService
  ) {}

  /**
   * Builds a complete DeFi strategy from natural language input.
   * 
   * This method processes user intent through multiple stages:
   * 1. Natural language parsing using AI
   * 2. Strategy simulation for accurate amount calculations
   * 3. Validation against available DeFi pairs
   * 4. Risk analysis and recommendations generation
   * 
   * @param dto - Strategy building parameters including user intent and token amount
   * @returns Complete strategy with steps, validation results, metadata, and AI analysis
   * @throws Error if strategy generation or validation fails
   */
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

    try {
      const steps =  await this.parser.parseNaturalLanguage(
        dto.userIntent,
        dto.additionalContext,
        dto.tokenAmount
      );

      console.log('Parsed steps from AI:', steps);

      // Simulate strategy execution to get accurate token amounts
      const workflowJson = this.createWorkflowJson(steps);
      console.log('Workflow JSON for simulation:', workflowJson);
      const simulationResult = await this.defiSimulationService.simulate(
        workflowJson, 
        dto.tokenAmount || 10
      );

      console.log('Simulation result:', simulationResult);

      // Extract steps from simulation result
      const simulatedSteps = simulationResult.steps || steps;

      // Validate steps against available DeFi pairs and protocols
      const validation = await this.validator.validateSteps(simulatedSteps);

      // Generate AI-powered risk analysis
      const aiAnalysis = await this.generateRiskAnalysis(simulatedSteps);

      // Calculate strategy metadata
      const metadata = await this.calculateStrategyMetadata(simulatedSteps, aiAnalysis);

      return {
        steps: simulatedSteps,
        validation: validation || { isValid: false, errors: ['Validation failed'], warnings: [] },
        metadata: metadata || { totalSteps: 0, estimatedGas: 0, riskLevel: 'UNKNOWN', aiGenerated: false },
        aiAnalysis: aiAnalysis || { riskFactors: [], recommendations: [] }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates AI-powered risk analysis for a strategy.
   * 
   * @param steps - Strategy steps to analyze
   * @returns Risk analysis with factors and recommendations, or undefined if analysis fails
   */
  private async generateRiskAnalysis(
    steps: StrategyStepResponseDto[]
  ): Promise<{ riskFactors: string[]; recommendations: string[] } | undefined> {
    try {
      const riskAnalysis = await this.geminiAi.analyzeStrategyRisk(steps);
      return {
        riskFactors: riskAnalysis.riskFactors,
        recommendations: riskAnalysis.recommendations,
      };
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Calculates strategy metadata including gas estimates and risk levels.
   * 
   * @param steps - Strategy steps to analyze
   * @param aiAnalysis - Optional AI analysis results
   * @returns Strategy metadata
   */
  private async calculateStrategyMetadata(
    steps: StrategyStepResponseDto[],
    aiAnalysis?: { riskFactors: string[]; recommendations: string[] }
  ): Promise<{
    totalSteps: number;
    estimatedGas: number;
    riskLevel: string;
    aiGenerated: boolean;
  }> {
    let riskLevel: string;

    if (aiAnalysis) {
      riskLevel = this.extractRiskLevelFromAnalysis(aiAnalysis);
    } else {
      // Fallback to rule-based risk calculation
      try {
        const riskAnalysis = await this.geminiAi.analyzeStrategyRisk(steps);
        riskLevel = riskAnalysis.riskLevel;
      } catch (error) {
        riskLevel = this.calculateRiskLevel(steps);
      }
    }

    return {
      totalSteps: steps.length,
      estimatedGas: this.estimateGas(steps),
      riskLevel,
      aiGenerated: true,
    };
  }

  /**
   * Extracts risk level from AI analysis results.
   * 
   * @param aiAnalysis - AI analysis containing risk factors
   * @returns Risk level string (LOW, MEDIUM, HIGH)
   */
  private extractRiskLevelFromAnalysis(aiAnalysis: { riskFactors: string[] }): string {
    const riskFactorCount = aiAnalysis.riskFactors.length;
    
    if (riskFactorCount === 0) return 'LOW';
    if (riskFactorCount >= 3) return 'HIGH';
    return 'MEDIUM';
  }

  /**
   * Estimates gas consumption for a complete strategy.
   * 
   * This method calculates total gas costs by summing estimated gas
   * for each step type. Gas estimates are based on historical data
   * and should be updated based on actual network conditions.
   * 
   * @param steps - Strategy steps to estimate gas for
   * @returns Total estimated gas consumption
   */
  private estimateGas(steps: StrategyStepResponseDto[]): number {
    // Gas estimates per operation type (based on historical data)
    const GAS_ESTIMATES: Record<string, number> = {
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

    return steps.reduce((totalGas, step) => {
      const stepGas = GAS_ESTIMATES[step.type] || 100000; // Default gas estimate
      return totalGas + stepGas;
    }, 0);
  }

  /**
   * Calculates risk level based on strategy characteristics.
   * 
   * Risk assessment is based on:
   * - Number of borrowing operations (higher borrowing = higher risk)
   * - Ratio of borrow steps to total steps
   * - Complexity of the strategy
   * 
   * @param steps - Strategy steps to analyze
   * @returns Risk level: 'LOW', 'MEDIUM', or 'HIGH'
   */
  private calculateRiskLevel(steps: StrategyStepResponseDto[]): string {
    const borrowSteps = steps.filter((step) => step.type === 'BORROW').length;
    const totalSteps = steps.length;
    const borrowRatio = borrowSteps / totalSteps;

    // Risk assessment based on borrowing ratio
    if (borrowSteps === 0) {
      return 'LOW'; // No borrowing = low risk
    }
    
    if (borrowRatio > 0.4) {
      return 'HIGH'; // High borrowing ratio = high risk
    }
    
    return 'MEDIUM'; // Moderate borrowing = medium risk
  }

  /**
   * Creates a workflow JSON object from strategy steps.
   * 
   * The simulation service expects a workflow_json object with a steps array,
   * not just the steps array directly.
   * 
   * @param steps - Strategy steps to wrap in workflow format
   * @returns Workflow JSON object compatible with simulation service
   */
  private createWorkflowJson(steps: StrategyStepResponseDto[]): { steps: StrategyStepResponseDto[] } {
    return { steps };
  }
}