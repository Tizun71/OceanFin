import { Injectable } from '@nestjs/common';
import { DefiPairsService } from '../../defi_modules/application/defi_pairs.service';
import { DefiTokenService } from '../../defi_token/application/defi_token.service';
import { DefiModuleActionsService } from '../../defi_modules/application/defi_module_actions.service';
import { OperationType } from '../../defi_modules/domain/operation-type.enum';

export interface AvailableOperation {
  type: OperationType;
  tokenIn?: {
    id: string;
    symbol: string;
    assetId: number;
  };
  tokenOut?: {
    id: string;
    symbol: string;
    assetId: number;
  };
  supported: boolean;
}

export interface StrategyConstraints {
  inputToken: {
    id: string;
    symbol: string;
    assetId: number;
  };
  availableOperations: AvailableOperation[];
  supportedTokens: Array<{
    id: string;
    symbol: string;
    assetId: number;
  }>;
  operationConstraints: {
    maxLeverage: number;
    supportedPairs: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

@Injectable()
export class StrategyConstraintsService {
  constructor(
    private readonly defiPairsService: DefiPairsService,
    private readonly defiTokenService: DefiTokenService,
  ) {}

  async getStrategyConstraints(
    inputTokenSymbol: string,
    userIntent: string,
    additionalContext?: string
  ): Promise<StrategyConstraints> {
    // Get input token details
    const inputToken = await this.getTokenBySymbol(inputTokenSymbol);
    
    // Get available operations for this token
    const availableOperations = await this.getAvailableOperations(inputToken.id);
    
    // Get all supported tokens
    const supportedTokens = await this.getAllSupportedTokens();
    
    // Analyze constraints from user intent
    const operationConstraints = this.analyzeOperationConstraints(
      userIntent,
      additionalContext
    );

    return {
      inputToken,
      availableOperations,
      supportedTokens,
      operationConstraints,
    };
  }

  private async getTokenBySymbol(symbol: string): Promise<{
    id: string;
    symbol: string;
    assetId: number;
  }> {
    try {
      // This is a simplified approach - in real implementation,
      // you'd query the database for token by symbol
      const tokenMap = {
        'DOT': { id: 'dot-token-id', symbol: 'DOT', assetId: 5 },
        'VDOT': { id: 'vdot-token-id', symbol: 'VDOT', assetId: 18 },
        'GDOT': { id: 'gdot-token-id', symbol: 'GDOT', assetId: 69 },
        'USDT': { id: 'usdt-token-id', symbol: 'USDT', assetId: 10 },
        'USDC': { id: 'usdc-token-id', symbol: 'USDC', assetId: 22 },
      };
      
      const token = tokenMap[symbol.toUpperCase()];
      if (!token) {
        throw new Error(`Unsupported token: ${symbol}`);
      }
      
      return token;
    } catch (error) {
      throw new Error(`Failed to get token details for ${symbol}: ${error.message}`);
    }
  }

  private async getAvailableOperations(tokenId: string): Promise<AvailableOperation[]> {
    try {
      const { asInput, asOutput } = await this.defiPairsService.getAvailablePairsForToken(tokenId);
      const operations: AvailableOperation[] = [];

      // Process pairs where this token is input
      for (const pair of asInput) {
        const tokenOut = await this.getTokenById(pair.token_out_id!);
        
        operations.push({
          type: OperationType.SWAP,
          tokenIn: await this.getTokenById(tokenId),
          tokenOut,
          supported: true,
        });

        operations.push({
          type: OperationType.JOIN_STRATEGY,
          tokenIn: await this.getTokenById(tokenId),
          tokenOut,
          supported: true,
        });
      }

      // Process pairs where this token is output
      for (const pair of asOutput) {
        const tokenIn = await this.getTokenById(pair.token_in_id!);
        
        operations.push({
          type: OperationType.BORROW,
          tokenIn,
          tokenOut: await this.getTokenById(tokenId),
          supported: true,
        });
      }

      // Add SUPPLY operation (token can always be supplied)
      operations.push({
        type: OperationType.SUPPLY,
        tokenIn: await this.getTokenById(tokenId),
        supported: true,
      });

      // Add ENABLE_E_MODE (always available)
      operations.push({
        type: OperationType.ENABLE_E_MODE,
        supported: true,
      });

      return operations;
    } catch (error) {
      console.error('Failed to get available operations:', error);
      return [];
    }
  }

  private async getTokenById(tokenId: string): Promise<{
    id: string;
    symbol: string;
    assetId: number;
  }> {
    // Simplified implementation - in real app, query database
    const tokenMap = {
      'dot-token-id': { id: 'dot-token-id', symbol: 'DOT', assetId: 5 },
      'vdot-token-id': { id: 'vdot-token-id', symbol: 'VDOT', assetId: 18 },
      'gdot-token-id': { id: 'gdot-token-id', symbol: 'GDOT', assetId: 69 },
      'usdt-token-id': { id: 'usdt-token-id', symbol: 'USDT', assetId: 10 },
      'usdc-token-id': { id: 'usdc-token-id', symbol: 'USDC', assetId: 22 },
    };
    
    return tokenMap[tokenId] || { id: tokenId, symbol: 'UNKNOWN', assetId: 0 };
  }

  private async getAllSupportedTokens(): Promise<Array<{
    id: string;
    symbol: string;
    assetId: number;
  }>> {
    // In real implementation, query all tokens from database
    return [
      { id: 'dot-token-id', symbol: 'DOT', assetId: 5 },
      { id: 'vdot-token-id', symbol: 'VDOT', assetId: 18 },
      { id: 'gdot-token-id', symbol: 'GDOT', assetId: 69 },
      { id: 'usdt-token-id', symbol: 'USDT', assetId: 10 },
      { id: 'usdc-token-id', symbol: 'USDC', assetId: 22 },
    ];
  }

  private analyzeOperationConstraints(
    userIntent: string,
    additionalContext?: string
  ): {
    maxLeverage: number;
    supportedPairs: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } {
    const intent = userIntent.toLowerCase();
    const context = additionalContext?.toLowerCase() || '';
    
    let maxLeverage = 3; // Default
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

    // Analyze risk tolerance
    if (intent.includes('conservative') || intent.includes('safe') || context.includes('low risk')) {
      maxLeverage = 2;
      riskLevel = 'LOW';
    } else if (intent.includes('aggressive') || intent.includes('maximum') || context.includes('high risk')) {
      maxLeverage = 10;
      riskLevel = 'HIGH';
    } else if (intent.includes('moderate')) {
      maxLeverage = 5;
      riskLevel = 'MEDIUM';
    }

    // Override based on specific constraints
    if (context.includes('max') && context.includes('leverage')) {
      const leverageMatch = context.match(/max(?:imum)?\s*(\d+)x?\s*leverage/);
      if (leverageMatch) {
        maxLeverage = parseInt(leverageMatch[1]);
      }
    }

    return {
      maxLeverage,
      supportedPairs: [], // Will be populated based on available pairs
      riskLevel,
    };
  }

  async validateOperationSupport(
    operationType: OperationType,
    tokenInId?: string,
    tokenOutId?: string
  ): Promise<boolean> {
    try {
      switch (operationType) {
        case OperationType.SWAP:
        case OperationType.JOIN_STRATEGY:
          if (!tokenInId || !tokenOutId) return false;
          const swapPairs = await this.defiPairsService.getAvailableOperationsForTokenPair(
            tokenInId,
            tokenOutId
          );
          return swapPairs.length > 0;

        case OperationType.SUPPLY:
          if (!tokenInId) return false;
          const { asInput } = await this.defiPairsService.getAvailablePairsForToken(tokenInId);
          return asInput.length > 0;

        case OperationType.BORROW:
          if (!tokenOutId) return false;
          const { asOutput } = await this.defiPairsService.getAvailablePairsForToken(tokenOutId);
          return asOutput.length > 0;

        case OperationType.ENABLE_E_MODE:
          return true; // Always supported

        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to validate operation support:', error);
      return false;
    }
  }
}