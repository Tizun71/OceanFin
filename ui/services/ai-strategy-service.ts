import axios from 'axios';

// Create axios instance directly instead of importing from api-client
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    try {
      const response = await apiClient.post('/ai-strategy-builder/build', request);
      return response.data;
    } catch (error: any) {
      console.error('Failed to build strategy:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const statusText = error.response.statusText;
        const serverMessage = error.response.data?.message || 'Unknown server error';
        
        console.error('Server error details:', {
          status,
          statusText,
          data: error.response.data
        });
        
        // Create concise error message
        let errorMessage = `${status} ${statusText}: ${serverMessage}`;
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network error:', error.request);
        throw new Error('Network error: Unable to connect to server');
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        throw new Error(error.message || 'Failed to build strategy');
      }
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