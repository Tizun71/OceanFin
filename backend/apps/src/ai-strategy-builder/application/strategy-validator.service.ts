import { Injectable } from '@nestjs/common';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';
import { DefiPairsService } from '../../defi_modules/application/defi_pairs.service';
import { DefiTokenService } from '../../defi_token/application/defi_token.service';
import { OperationType } from '../../defi_modules/domain/operation-type.enum';
import { EstimateDefiPairDto } from '../../defi_modules/interfaces/dtos/estimate-defi-pair.dto';

@Injectable()
export class StrategyValidatorService {
  constructor(
    private readonly defiPairsService: DefiPairsService,
    private readonly defiTokenService: DefiTokenService,
  ) {}

  async validateSteps(steps: StrategyStepResponseDto[]): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Validate step structure
      if (!step.type || !step.agent) {
        errors.push(`Step ${i + 1}: Missing required fields (type, agent)`);
        continue;
      }

      // Validate operation type
      if (!this.isValidOperationType(step.type)) {
        errors.push(`Step ${i + 1}: Invalid operation type '${step.type}'`);
        continue;
      }

      // Validate token pairs for operations that need them
      if (this.requiresTokenValidation(step.type)) {
        const pairValidation = await this.validateTokenPair(step);
        if (!pairValidation.isValid) {
          errors.push(`Step ${i + 1}: ${pairValidation.error}`);
        }
      }

      // Check for sequential logic issues
      if (i > 0) {
        const sequenceValidation = this.validateSequence(steps[i - 1], step);
        if (!sequenceValidation.isValid) {
          warnings.push(`Step ${i + 1}: ${sequenceValidation.warning}`);
        }
      }

      // Validate amounts
      if (step.tokenIn?.amount && step.tokenIn.amount <= 0) {
        errors.push(`Step ${i + 1}: Invalid tokenIn amount (must be > 0)`);
      }
      if (step.tokenOut?.amount && step.tokenOut.amount <= 0) {
        errors.push(`Step ${i + 1}: Invalid tokenOut amount (must be > 0)`);
      }
    }

    // Validate overall strategy
    const strategyValidation = this.validateOverallStrategy(steps);
    errors.push(...strategyValidation.errors);
    warnings.push(...strategyValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private isValidOperationType(type: string): boolean {
    const validTypes = [
      'SWAP',
      'SUPPLY',
      'BORROW',
      'JOIN_STRATEGY',
      'ENABLE_E_MODE',
      'BRIDGE',
      'STAKE',
      'UNSTAKE',
      'CLAIM_REWARDS',
    ];
    return validTypes.includes(type);
  }

  private requiresTokenValidation(type: string): boolean {
    return ['SWAP', 'SUPPLY', 'BORROW', 'JOIN_STRATEGY'].includes(type);
  }

  private async validateTokenPair(
    step: StrategyStepResponseDto,
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Map step type to OperationType enum
      let operationType: OperationType;
      switch (step.type) {
        case 'SWAP':
          operationType = OperationType.SWAP;
          break;
        case 'SUPPLY':
          operationType = OperationType.SUPPLY;
          break;
        case 'BORROW':
          operationType = OperationType.BORROW;
          break;
        case 'JOIN_STRATEGY':
          operationType = OperationType.JOIN_STRATEGY;
          break;
        default:
          return { isValid: true }; // Skip validation for other types
      }

      // For SWAP and JOIN_STRATEGY, validate both tokenIn and tokenOut
      if (
        (operationType === OperationType.SWAP ||
          operationType === OperationType.JOIN_STRATEGY) &&
        step.tokenIn &&
        step.tokenOut
      ) {
        // Convert assetId to entity id
        const [tokenInEntity, tokenOutEntity] = await Promise.all([
          this.getTokenIdByAssetId(step.tokenIn.assetId),
          this.getTokenIdByAssetId(step.tokenOut.assetId),
        ]);

        // Check if this pair is supported by estimating it
        const estimate = await this.defiPairsService.estimateDefiPair({
          operation_type: operationType,
          token_in_id: tokenInEntity,
          token_out_id: tokenOutEntity,
          amount_in: step.tokenIn.amount,
        });

        if (!estimate) {
          return {
            isValid: false,
            error: `Token pair ${step.tokenIn.symbol}/${step.tokenOut.symbol} not supported for ${step.type}`,
          };
        }
      }

      // For SUPPLY, validate tokenIn
      if (operationType === OperationType.SUPPLY && step.tokenIn) {
        // Convert assetId to entity id
        const tokenInEntity = await this.getTokenIdByAssetId(step.tokenIn.assetId);

        const estimate = await this.defiPairsService.estimateDefiPair({
          operation_type: operationType,
          token_in_id: tokenInEntity,
          amount_in: step.tokenIn.amount,
        });

        if (!estimate) {
          return {
            isValid: false,
            error: `Token ${step.tokenIn.symbol} not supported for SUPPLY`,
          };
        }
      }

      // For BORROW, validate tokenOut
      if (operationType === OperationType.BORROW && step.tokenOut) {
        // Borrow needs collateral context from previous steps
        // For now, we'll do a basic validation
        return { isValid: true };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to validate token pair: ${error.message}`,
      };
    }
  }

  private async getTokenIdByAssetId(assetId: string): Promise<string> {
    try {
      const token = await this.defiTokenService.getDefiTokenByAssetId(assetId);
      return token.id;
    } catch (error) {
      throw new Error(`Failed to find token with assetId ${assetId}: ${error.message}`);
    }
  }

  private validateSequence(
    prevStep: StrategyStepResponseDto,
    currentStep: StrategyStepResponseDto,
  ): { isValid: boolean; warning?: string } {
    // Check if output of previous step matches input of current step
    if (prevStep.tokenOut && currentStep.tokenIn) {
      if (prevStep.tokenOut.symbol !== currentStep.tokenIn.symbol) {
        return {
          isValid: false,
          warning: `Token mismatch: previous step outputs ${prevStep.tokenOut.symbol} but current step expects ${currentStep.tokenIn.symbol}`,
        };
      }

      // Check if amounts are reasonable (output should roughly match input)
      const amountDiff = Math.abs(prevStep.tokenOut.amount - currentStep.tokenIn.amount);
      if (amountDiff > prevStep.tokenOut.amount * 0.5) {
        return {
          isValid: false,
          warning: `Large amount discrepancy between steps (${prevStep.tokenOut.amount} vs ${currentStep.tokenIn.amount})`,
        };
      }
    }

    // Check for logical sequence issues
    if (currentStep.type === 'BORROW' && prevStep.type !== 'SUPPLY' && prevStep.type !== 'JOIN_STRATEGY') {
      return {
        isValid: false,
        warning: 'BORROW should typically follow SUPPLY or JOIN_STRATEGY',
      };
    }

    return { isValid: true };
  }

  private validateOverallStrategy(steps: StrategyStepResponseDto[]): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for E-Mode if there are borrow operations
    const hasBorrow = steps.some((s) => s.type === 'BORROW');
    const hasEMode = steps.some((s) => s.type === 'ENABLE_E_MODE');

    if (hasBorrow && !hasEMode) {
      warnings.push('Strategy includes BORROW but no ENABLE_E_MODE - consider adding it for better rates');
    }

    // Check for excessive looping
    const loopCount = steps.filter((s) => s.type === 'BORROW').length;
    if (loopCount > 10) {
      warnings.push(`Strategy has ${loopCount} loops - this may be excessive and risky`);
    }

    // Check for supply before borrow
    const firstBorrowIndex = steps.findIndex((s) => s.type === 'BORROW');
    const firstSupplyIndex = steps.findIndex(
      (s) => s.type === 'SUPPLY' || s.type === 'JOIN_STRATEGY',
    );

    if (firstBorrowIndex !== -1 && firstSupplyIndex === -1) {
      errors.push('Cannot BORROW without first supplying collateral');
    }

    if (firstBorrowIndex !== -1 && firstSupplyIndex > firstBorrowIndex) {
      errors.push('Must SUPPLY collateral before BORROW');
    }

    // Check for minimum steps
    if (steps.length === 0) {
      errors.push('Strategy must have at least one step');
    }

    return { errors, warnings };
  }
}
