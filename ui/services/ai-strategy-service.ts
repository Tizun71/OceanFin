import { apiClient } from './api-client';

export interface StrategyStep {
  step: number;
  type: string;
  agent: string;
  tokenIn?: {
    assetId: string;
    symbol: string;
    amount: number;
  };
  tokenOut?: {
    assetId: string;
    symbol: string;
    amount: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StrategyMetadata {
  totalSteps: number;
  estimatedGas: number;
  riskLevel: string;
  aiGenerated: boolean;
}

export interface AIAnalysis {
  riskFactors: string[];
  recommendations: string[];
}

export interface BuildStrategyResponse {
  steps: StrategyStep[];
  validation: ValidationResult;
  metadata: StrategyMetadata;
  aiAnalysis?: AIAnalysis;
}

export interface BuildStrategyRequest {
  userIntent: string;
  additionalContext?: string;
}

export class AIStrategyService {
  static async buildStrategy(request: BuildStrategyRequest): Promise<BuildStrategyResponse> {
    try {
      const response = await apiClient.post('/ai-strategy-builder/build', request);
      return response.data;
    } catch (error: any) {
      console.error('Failed to build strategy:', error);
      throw new Error(error.response?.data?.message || 'Failed to build strategy');
    }
  }

  static formatTokenToContext(tokenSymbol: string): string {
    return `My initial token is ${tokenSymbol}`;
  }

  static validatePrompt(prompt: string): { isValid: boolean; error?: string } {
    if (!prompt.trim()) {
      return { isValid: false, error: 'Please enter your strategy prompt.' };
    }

    if (prompt.length < 10) {
      return { isValid: false, error: 'Strategy prompt must be at least 10 characters long.' };
    }

    if (prompt.length > 2000) {
      return { isValid: false, error: 'Strategy prompt must be less than 2000 characters.' };
    }

    return { isValid: true };
  }
}