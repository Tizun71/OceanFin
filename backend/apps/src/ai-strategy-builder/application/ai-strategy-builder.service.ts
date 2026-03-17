import { Injectable } from '@nestjs/common';
import { StrategyParserService } from './strategy-parser.service';
import { StrategyValidatorService } from './strategy-validator.service';
import { GeminiAiService } from './gemini-ai.service';
import { BuildStrategyDto } from '../interfaces/dtos/build-strategy.dto';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';

@Injectable()
export class AiStrategyBuilderService {
  constructor(
    private readonly parser: StrategyParserService,
    private readonly validator: StrategyValidatorService,
    private readonly geminiAi: GeminiAiService,
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
    // Parse natural language to steps using Gemini AI
    const steps = await this.parser.parseNaturalLanguage(
      dto.userIntent,
      dto.additionalContext
    );

    // Validate steps against DefiPair entities
    const validation = await this.validator.validateSteps(steps);

    // Get AI risk analysis
    let aiAnalysis;
    try {
      const riskAnalysis = await this.geminiAi.analyzeStrategyRisk(steps);
      aiAnalysis = {
        riskFactors: riskAnalysis.riskFactors,
        recommendations: riskAnalysis.recommendations,
      };
    } catch (error) {
      console.warn('AI risk analysis failed:', error.message);
    }

    // Calculate metadata
    const metadata = {
      totalSteps: steps.length,
      estimatedGas: this.estimateGas(steps),
      riskLevel: aiAnalysis ? 
        (await this.geminiAi.analyzeStrategyRisk(steps)).riskLevel : 
        this.calculateRiskLevel(steps),
      aiGenerated: true,
    };

    return {
      steps,
      validation,
      metadata,
      aiAnalysis,
    };
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
