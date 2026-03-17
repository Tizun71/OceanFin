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
  tokenAmount?: number;
}

export class AIStrategyService {
  static async buildStrategy(request: BuildStrategyRequest): Promise<BuildStrategyResponse> {
    // Mock response for testing
    return {
      steps: [
        {
          step: 1,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '5', symbol: 'DOT', amount: request.tokenAmount || 100 }
        },
        {
          step: 2,
          type: 'BORROW',
          agent: 'HYDRATION',
          tokenOut: { assetId: '22', symbol: 'USDC', amount: 70 }
        }
      ],
      validation: { isValid: true, errors: [], warnings: [] },
      metadata: { totalSteps: 2, estimatedGas: 250000, riskLevel: 'MEDIUM', aiGenerated: true },
      aiAnalysis: { riskFactors: ['Liquidation risk'], recommendations: ['Monitor LTV ratio'] }
    };
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

  static validateTokenConsistency(
    steps: StrategyStep[], 
    selectedToken: string
  ): { isValid: boolean; error?: string } {
    if (!steps || steps.length === 0) {
      return { isValid: true };
    }

    // Find the first step that has tokenIn (skip ENABLE_E_MODE)
    let checkStepIndex = 0;
    
    // If step 1 is ENABLE_E_MODE, check step 2 instead
    if (steps[0]?.type === 'ENABLE_E_MODE') {
      checkStepIndex = 1;
    }

    // Check if the step exists and has tokenIn
    const stepToCheck = steps[checkStepIndex];
    if (!stepToCheck || !stepToCheck.tokenIn?.symbol) {
      return { isValid: true }; // No token to validate
    }

    const stepTokenSymbol = stepToCheck.tokenIn.symbol.toUpperCase();
    const startingTokenSymbol = selectedToken.toUpperCase();

    if (stepTokenSymbol !== startingTokenSymbol) {
      return { 
        isValid: false, 
        error: `Choose token consistency for the workflow. Starting token is ${startingTokenSymbol} but step ${checkStepIndex + 1} expects ${stepTokenSymbol}.` 
      };
    }

    return { isValid: true };
  }
}