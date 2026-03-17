import { Injectable } from '@nestjs/common';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';
import { GeminiAiService } from './gemini-ai.service';

@Injectable()
export class StrategyParserService {
  constructor(private readonly geminiAi: GeminiAiService) {}

  async parseNaturalLanguage(
    userIntent: string,
    additionalContext?: string
  ): Promise<StrategyStepResponseDto[]> {
    try {
      // Check if input is structured steps format
      if (this.isStructuredStepsFormat(userIntent)) {
        console.log('Using structured steps parsing');
        return this.parseStructuredSteps(userIntent, additionalContext);
      }

      // Use Gemini AI to generate strategy steps
      console.log('Using Gemini AI parsing');
      const steps = await this.geminiAi.generateStrategySteps(
        userIntent,
        additionalContext
      );
      
      // Validate and sanitize the generated steps
      return this.validateAndSanitizeSteps(steps);
    } catch (error) {
      console.error('Gemini parsing failed, falling back to rule-based parsing:', error);
      
      // Fallback to rule-based parsing if Gemini fails
      return this.fallbackParsing(userIntent);
    }
  }

  private validateAndSanitizeSteps(steps: any[]): StrategyStepResponseDto[] {
    if (!Array.isArray(steps)) {
      throw new Error('Generated steps must be an array');
    }

    return steps.map((step, index) => {
      // Ensure required fields
      if (!step.type || !step.agent) {
        throw new Error(`Step ${index + 1}: Missing required fields (type, agent)`);
      }

      // Validate step number
      const stepNumber = step.step || index + 1;

      // Validate operation type
      const validTypes = [
        'SWAP', 'SUPPLY', 'BORROW', 'JOIN_STRATEGY', 'ENABLE_E_MODE',
        'BRIDGE', 'STAKE', 'UNSTAKE', 'CLAIM_REWARDS'
      ];
      
      if (!validTypes.includes(step.type)) {
        throw new Error(`Step ${stepNumber}: Invalid operation type '${step.type}'`);
      }

      // Sanitize amounts
      if (step.tokenIn?.amount) {
        step.tokenIn.amount = Number(Number(step.tokenIn.amount).toFixed(6));
      }
      if (step.tokenOut?.amount) {
        step.tokenOut.amount = Number(Number(step.tokenOut.amount).toFixed(6));
      }

      return {
        step: stepNumber,
        type: step.type,
        agent: step.agent,
        tokenIn: step.tokenIn,
        tokenOut: step.tokenOut,
      };
    });
  }

  private async fallbackParsing(
    userIntent: string
  ): Promise<StrategyStepResponseDto[]> {
    const normalizedIntent = userIntent.toLowerCase().trim();
    
    // Extract input token and amount from intent
    const { inputToken, defaultAmount } = this.extractInputTokenFromIntent(userIntent);
    const tokenSymbol = inputToken;
    const amount = defaultAmount;

    // Auto-detect asset ID
    const assetId = this.getAssetIdBySymbol(tokenSymbol);
    const inputTokenObj = { symbol: tokenSymbol, amount, assetId };

    // Detect strategy type based on intent and token
    if (this.isGDOTLooping(normalizedIntent, tokenSymbol)) {
      return this.parseGDOTLooping(amount, assetId, normalizedIntent);
    } else if (this.isVDOTLooping(normalizedIntent, tokenSymbol)) {
      return this.parseVDOTLooping(amount, assetId, normalizedIntent);
    } else if (this.isCustomStrategy(normalizedIntent)) {
      return this.parseCustomStrategy(normalizedIntent, inputTokenObj);
    }

    // If no specific strategy detected, create a simple supply strategy
    return this.createSimpleSupplyStrategy(inputTokenObj);
  }

  private isStructuredStepsFormat(input: string): boolean {
    // Check for numbered steps pattern like "1. Supply", "2. Borrow", etc.
    // Also handle cases like "1. Supply DOT, 2. Borrow USDC, 3. Supply USDC"
    const numberedStepsPattern = /\d+\.\s*(supply|lend|borrow|swap|join|stake)/i;
    const hasMultipleSteps = (input.match(/\d+\./g) || []).length >= 2;
    
    return numberedStepsPattern.test(input) && hasMultipleSteps;
  }

  private parseStructuredSteps(
    input: string,
    additionalContext?: string
  ): StrategyStepResponseDto[] {
    const steps: StrategyStepResponseDto[] = [];
    
    // Extract input token and amount from the user intent
    const { inputToken, defaultAmount } = this.extractInputTokenFromIntent(input);
    
    // Extract numbered steps using regex
    const stepMatches = input.match(/\d+\.\s*[^,\d]+/g) || [];
    
    let stepNumber = 1;
    let currentTokenAmounts: { [symbol: string]: number } = {
      [inputToken]: defaultAmount
    };
    
    for (const stepMatch of stepMatches) {
      const normalizedStep = stepMatch.toLowerCase().trim();
      
      // Parse each step based on action keywords
      if (normalizedStep.includes('lend') || normalizedStep.includes('supply')) {
        const step = this.parseSupplyStepWithContext(stepMatch, stepNumber, inputToken, defaultAmount, currentTokenAmounts);
        if (step) {
          steps.push(step);
          // Update available amounts after supply
          if (step.tokenIn) {
            currentTokenAmounts[step.tokenIn.symbol] = Math.max(0, 
              (currentTokenAmounts[step.tokenIn.symbol] || 0) - step.tokenIn.amount
            );
          }
        }
      } else if (normalizedStep.includes('borrow')) {
        const step = this.parseBorrowStepWithContext(stepMatch, stepNumber, inputToken, defaultAmount, currentTokenAmounts);
        if (step) {
          steps.push(step);
          // Update available amounts after borrow
          if (step.tokenOut) {
            currentTokenAmounts[step.tokenOut.symbol] = 
              (currentTokenAmounts[step.tokenOut.symbol] || 0) + step.tokenOut.amount;
          }
        }
      } else if (normalizedStep.includes('swap') || normalizedStep.includes('exchange')) {
        const step = this.parseSwapStepFromIntent(stepMatch, stepNumber, inputToken, defaultAmount);
        if (step) {
          steps.push(step);
          // Update amounts after swap
          if (step.tokenIn && step.tokenOut) {
            currentTokenAmounts[step.tokenIn.symbol] = Math.max(0,
              (currentTokenAmounts[step.tokenIn.symbol] || 0) - step.tokenIn.amount
            );
            currentTokenAmounts[step.tokenOut.symbol] = 
              (currentTokenAmounts[step.tokenOut.symbol] || 0) + step.tokenOut.amount;
          }
        }
      } else if (normalizedStep.includes('join') || normalizedStep.includes('stake')) {
        const step = this.parseJoinStrategyStepFromIntent(stepMatch, stepNumber, inputToken, defaultAmount);
        if (step) steps.push(step);
      }
      
      stepNumber++;
    }

    // Add E-Mode only for GDOT/VDOT strategies or when explicitly requested
    const hasJoinStrategy = steps.some(s => s.type === 'JOIN_STRATEGY');
    const explicitEMode = /enable\s+e\s*mode/i.test(input);
    const hasGDOTVDOT = /gdot|vdot/i.test(input);
    
    if (hasJoinStrategy || explicitEMode || hasGDOTVDOT) {
      steps.unshift({
        step: 0,
        type: 'ENABLE_E_MODE',
        agent: 'HYDRATION',
      });
      
      // Renumber steps
      steps.forEach((step, index) => {
        step.step = index + 1;
      });
    }

    return steps;
  }

  private parseSupplyStep(
    stepLine: string,
    stepNumber: number,
    inputToken: { symbol: string; amount: number; assetId?: string }
  ): StrategyStepResponseDto | null {
    // Extract token from step like "Supply DOT" or "Supply USDC"
    const tokenMatch = stepLine.match(/supply\s+(DOT|VDOT|GDOT|USDT|USDC)/i);
    const percentageMatch = stepLine.match(/(\d+)%/);
    
    // If no specific token mentioned, use input token for first supply, otherwise default to DOT
    let token: string;
    if (tokenMatch) {
      token = tokenMatch[1].toUpperCase();
    } else if (stepNumber === 1) {
      token = inputToken.symbol.toUpperCase();
    } else {
      // For subsequent supply steps without specific token, try to infer from context
      token = 'DOT'; // Default fallback
    }
    
    const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 100;
    const amount = (inputToken.amount * percentage) / 100;
    
    return {
      step: stepNumber,
      type: 'SUPPLY',
      agent: 'HYDRATION',
      tokenIn: {
        assetId: this.getAssetIdBySymbol(token),
        symbol: token,
        amount: Number(amount.toFixed(6)),
      },
    };
  }

  private extractInputTokenFromIntent(input: string): { inputToken: string; defaultAmount: number } {
    // Extract token and amount from patterns
    const amountMatch = input.match(/(\d+(?:\.\d+)?)\s*(DOT|VDOT|GDOT|USDT|USDC)/i);
    const tokenMatch = input.match(/(DOT|VDOT|GDOT|USDT|USDC)/i);
    
    // Check for explicit initial token specification
    const initialTokenMatch = input.match(/initial\s+token\s+is\s+(DOT|VDOT|GDOT|USDT|USDC)/i);
    const withTokenMatch = input.match(/with\s+(\d+(?:\.\d+)?)\s*(DOT|VDOT|GDOT|USDT|USDC)/i);
    
    let inputToken = 'DOT'; // Default token
    let defaultAmount = 10; // Default amount
    
    // Priority 1: Explicit initial token specification
    if (initialTokenMatch) {
      inputToken = initialTokenMatch[1].toUpperCase();
    }
    // Priority 2: Amount with token specification
    else if (withTokenMatch) {
      defaultAmount = parseFloat(withTokenMatch[1]);
      inputToken = withTokenMatch[2].toUpperCase();
    }
    else if (amountMatch) {
      defaultAmount = parseFloat(amountMatch[1]);
      inputToken = amountMatch[2].toUpperCase();
    }
    // Priority 3: For looping strategies, determine the correct input token
    else if (input.toLowerCase().includes('gdot') && input.toLowerCase().includes('loop')) {
      // GDOT looping starts with DOT by default (unless overridden above)
      inputToken = 'DOT';
    } else if (input.toLowerCase().includes('vdot') && input.toLowerCase().includes('loop')) {
      // VDOT looping starts with DOT by default (unless overridden above)
      inputToken = 'DOT';
    } else if (tokenMatch) {
      // If only token is mentioned, use it
      inputToken = tokenMatch[1].toUpperCase();
    }
    
    return { inputToken, defaultAmount };
  }

  private parseSupplyStepWithContext(
    stepLine: string,
    stepNumber: number,
    defaultInputToken: string,
    defaultAmount: number,
    currentTokenAmounts: { [symbol: string]: number }
  ): StrategyStepResponseDto | null {
    // Extract token from step like "Supply DOT" or "Supply USDC"
    const tokenMatch = stepLine.match(/supply\s+(DOT|VDOT|GDOT|USDT|USDC)/i);
    const percentageMatch = stepLine.match(/(\d+)%/);
    
    let token: string;
    let amount: number;
    
    if (tokenMatch) {
      token = tokenMatch[1].toUpperCase();
      // Use available amount for this token
      const availableAmount = currentTokenAmounts[token] || defaultAmount;
      const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 100;
      amount = (availableAmount * percentage) / 100;
    } else if (stepNumber === 1) {
      token = defaultInputToken;
      const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 100;
      amount = (defaultAmount * percentage) / 100;
    } else {
      // Default fallback
      token = 'DOT';
      amount = defaultAmount;
    }
    
    return {
      step: stepNumber,
      type: 'SUPPLY',
      agent: 'HYDRATION',
      tokenIn: {
        assetId: this.getAssetIdBySymbol(token),
        symbol: token,
        amount: Number(amount.toFixed(6)),
      },
    };
  }

  private parseBorrowStepWithContext(
    stepLine: string,
    stepNumber: number,
    defaultInputToken: string,
    defaultAmount: number,
    currentTokenAmounts: { [symbol: string]: number }
  ): StrategyStepResponseDto | null {
    // Extract token from step like "Borrow USDC" or "Borrow USDT using USDC at 50% LTV"
    const borrowTokenMatch = stepLine.match(/borrow\s+(DOT|VDOT|GDOT|USDT|USDC)/i);
    const collateralTokenMatch = stepLine.match(/using.*?(DOT|VDOT|GDOT|USDT|USDC)/i);
    const ltvMatch = stepLine.match(/(\d+)%\s*ltv/i);
    
    const borrowToken = borrowTokenMatch ? borrowTokenMatch[1].toUpperCase() : 'DOT';
    const ltv = ltvMatch ? parseInt(ltvMatch[1]) : 50; // Default 50% LTV
    
    // Calculate borrow amount based on available collateral
    let borrowAmount: number;
    if (collateralTokenMatch) {
      const collateralToken = collateralTokenMatch[1].toUpperCase();
      const collateralAmount = currentTokenAmounts[collateralToken] || defaultAmount;
      borrowAmount = (collateralAmount * ltv) / 100;
    } else {
      // Use a reasonable default based on input token
      borrowAmount = (defaultAmount * ltv) / 100;
    }
    
    return {
      step: stepNumber,
      type: 'BORROW',
      agent: 'HYDRATION',
      tokenOut: {
        assetId: this.getAssetIdBySymbol(borrowToken),
        symbol: borrowToken,
        amount: Number(borrowAmount.toFixed(6)),
      },
    };
  }

  private parseSwapStepFromIntent(
    stepLine: string,
    stepNumber: number,
    defaultInputToken: string,
    defaultAmount: number
  ): StrategyStepResponseDto | null {
    // Extract tokens from step like "Swap DOT to VDOT"
    const swapMatch = stepLine.match(/swap\s+(\w+)\s+to\s+(\w+)/i);
    
    if (!swapMatch) return null;
    
    const tokenIn = swapMatch[1].toUpperCase();
    const tokenOut = swapMatch[2].toUpperCase();
    const amount = defaultAmount;
    
    // Estimate output amount based on conversion rates
    let outputAmount = amount;
    if (tokenIn === 'DOT' && tokenOut === 'VDOT') outputAmount = amount * 0.95;
    if (tokenIn === 'DOT' && tokenOut === 'GDOT') outputAmount = amount * 0.929;
    if (tokenIn === 'VDOT' && tokenOut === 'DOT') outputAmount = amount * 1.05;
    if (tokenIn === 'GDOT' && tokenOut === 'DOT') outputAmount = amount * 1.076;
    
    return {
      step: stepNumber,
      type: 'SWAP',
      agent: 'HYDRATION',
      tokenIn: {
        assetId: this.getAssetIdBySymbol(tokenIn),
        symbol: tokenIn,
        amount: Number(amount.toFixed(6)),
      },
      tokenOut: {
        assetId: this.getAssetIdBySymbol(tokenOut),
        symbol: tokenOut,
        amount: Number(outputAmount.toFixed(6)),
      },
    };
  }

  private parseJoinStrategyStepFromIntent(
    stepLine: string,
    stepNumber: number,
    defaultInputToken: string,
    defaultAmount: number
  ): StrategyStepResponseDto | null {
    // Extract tokens from step like "Join gDOT strategy with DOT"
    const joinMatch = stepLine.match(/(gdot|vdot)/i);
    
    if (!joinMatch) return null;
    
    const strategyToken = joinMatch[1].toUpperCase();
    const amount = defaultAmount;
    
    // DOT -> gDOT conversion
    const outputAmount = strategyToken === 'GDOT' ? amount * 0.929 : amount * 0.95;
    
    return {
      step: stepNumber,
      type: 'JOIN_STRATEGY',
      agent: 'HYDRATION',
      tokenIn: {
        assetId: this.getAssetIdBySymbol('DOT'),
        symbol: 'DOT',
        amount: Number(amount.toFixed(6)),
      },
      tokenOut: {
        assetId: this.getAssetIdBySymbol(strategyToken),
        symbol: strategyToken,
        amount: Number(outputAmount.toFixed(6)),
      },
    };
  }

  private parseBorrowStep(
    stepLine: string,
    stepNumber: number,
    inputToken: { symbol: string; amount: number; assetId?: string }
  ): StrategyStepResponseDto | null {
    // Extract token from step like "Borrow USDC" or "Borrow USDT using USDC at 50% LTV"
    const borrowTokenMatch = stepLine.match(/borrow\s+(DOT|VDOT|GDOT|USDT|USDC)/i);
    const collateralTokenMatch = stepLine.match(/using.*?(DOT|VDOT|GDOT|USDT|USDC)/i);
    const ltvMatch = stepLine.match(/(\d+)%\s*ltv/i);
    
    const borrowToken = borrowTokenMatch ? borrowTokenMatch[1].toUpperCase() : 'DOT';
    const ltv = ltvMatch ? parseInt(ltvMatch[1]) : 50;
    const borrowAmount = (inputToken.amount * ltv) / 100;
    
    return {
      step: stepNumber,
      type: 'BORROW',
      agent: 'HYDRATION',
      tokenOut: {
        assetId: this.getAssetIdBySymbol(borrowToken),
        symbol: borrowToken,
        amount: Number(borrowAmount.toFixed(6)),
      },
    };
  }

  private parseSwapStep(
    stepLine: string,
    stepNumber: number,
    inputToken: { symbol: string; amount: number; assetId?: string }
  ): StrategyStepResponseDto | null {
    // Extract tokens from step like "Swap DOT to VDOT"
    const swapMatch = stepLine.match(/swap\s+(\w+)\s+to\s+(\w+)/i);
    
    if (!swapMatch) return null;
    
    const tokenIn = swapMatch[1].toUpperCase();
    const tokenOut = swapMatch[2].toUpperCase();
    const amount = inputToken.amount;
    
    // Estimate output amount based on conversion rates
    let outputAmount = amount;
    if (tokenIn === 'DOT' && tokenOut === 'VDOT') outputAmount = amount * 0.95;
    if (tokenIn === 'DOT' && tokenOut === 'GDOT') outputAmount = amount * 0.929;
    if (tokenIn === 'VDOT' && tokenOut === 'DOT') outputAmount = amount * 1.05;
    if (tokenIn === 'GDOT' && tokenOut === 'DOT') outputAmount = amount * 1.076;
    
    return {
      step: stepNumber,
      type: 'SWAP',
      agent: 'HYDRATION',
      tokenIn: {
        assetId: this.getAssetIdBySymbol(tokenIn),
        symbol: tokenIn,
        amount: Number(amount.toFixed(6)),
      },
      tokenOut: {
        assetId: this.getAssetIdBySymbol(tokenOut),
        symbol: tokenOut,
        amount: Number(outputAmount.toFixed(6)),
      },
    };
  }

  private parseJoinStrategyStep(
    stepLine: string,
    stepNumber: number,
    inputToken: { symbol: string; amount: number; assetId?: string }
  ): StrategyStepResponseDto | null {
    // Extract tokens from step like "Join gDOT strategy with DOT"
    const joinMatch = stepLine.match(/(gdot|vdot)/i);
    
    if (!joinMatch) return null;
    
    const strategyToken = joinMatch[1].toUpperCase();
    const amount = inputToken.amount;
    
    // DOT -> gDOT conversion
    const outputAmount = strategyToken === 'GDOT' ? amount * 0.929 : amount * 0.95;
    
    return {
      step: stepNumber,
      type: 'JOIN_STRATEGY',
      agent: 'HYDRATION',
      tokenIn: {
        assetId: this.getAssetIdBySymbol('DOT'),
        symbol: 'DOT',
        amount: Number(amount.toFixed(6)),
      },
      tokenOut: {
        assetId: this.getAssetIdBySymbol(strategyToken),
        symbol: strategyToken,
        amount: Number(outputAmount.toFixed(6)),
      },
    };
  }

  private getAssetIdBySymbol(symbol: string): string {
    const tokenMap = {
      'DOT': '5',
      'VDOT': '18',
      'GDOT': '69',
      'USDT': '10',
      'USDC': '22',
    };
    return tokenMap[symbol] || '5'; // Default to DOT
  }

  private isGDOTLooping(intent: string, tokenSymbol: string): boolean {
    return (
      (intent.includes('gdot') || tokenSymbol === 'GDOT' || intent.includes('join strategy')) &&
      (intent.includes('loop') || intent.includes('leverage') || intent.includes('multiply') || intent.includes('yield') || intent.includes('maximize'))
    );
  }

  private isVDOTLooping(intent: string, tokenSymbol: string): boolean {
    return (
      (intent.includes('vdot') || tokenSymbol === 'VDOT' || intent.includes('liquid staking')) &&
      (intent.includes('loop') || intent.includes('leverage') || intent.includes('multiply') || intent.includes('yield') || intent.includes('maximize'))
    );
  }

  private isCustomStrategy(intent: string): boolean {
    return (
      intent.includes('swap') ||
      intent.includes('supply') ||
      intent.includes('borrow') ||
      intent.includes('stake') ||
      intent.includes('diversif') ||
      intent.includes('arbitrage') ||
      intent.includes('trade')
    );
  }

  private async parseGDOTLooping(
    amount: number,
    assetId: string,
    intent: string
  ): Promise<StrategyStepResponseDto[]> {
    const iterations = this.extractIterationsFromIntent(intent);
    const { inputToken } = this.extractInputTokenFromIntent(intent);

    const steps: StrategyStepResponseDto[] = [];
    let stepNumber = 1;

    // Enable E-Mode
    steps.push({
      step: stepNumber++,
      type: 'ENABLE_E_MODE',
      agent: 'HYDRATION',
    });

    let currentAmount = amount;
    let currentToken = inputToken;

    // If starting token is not DOT, swap to DOT first
    if (inputToken !== 'DOT') {
      const dotAmount = this.estimateSwapAmount(inputToken, 'DOT', currentAmount);
      
      steps.push({
        step: stepNumber++,
        type: 'SWAP',
        agent: 'HYDRATION',
        tokenIn: {
          assetId: this.getAssetIdBySymbol(inputToken),
          symbol: inputToken,
          amount: Number(currentAmount.toFixed(5)),
        },
        tokenOut: {
          assetId: '5',
          symbol: 'DOT',
          amount: Number(dotAmount.toFixed(5)),
        },
      });

      currentAmount = dotAmount;
      currentToken = 'DOT';
    }

    let iterationAmount = currentAmount;

    for (let i = 0; i < iterations; i++) {
      // Join Strategy (DOT -> gDOT)
      const gdotAmount = iterationAmount * 0.929; // Approximate conversion rate

      steps.push({
        step: stepNumber++,
        type: 'JOIN_STRATEGY',
        agent: 'HYDRATION',
        tokenIn: {
          assetId: '5', // Always DOT for input
          symbol: 'DOT',
          amount: Number(iterationAmount.toFixed(5)),
        },
        tokenOut: {
          assetId: '69', // Always GDOT for output
          symbol: 'GDOT',
          amount: Number(gdotAmount.toFixed(5)),
        },
      });

      // Borrow DOT (using GDOT as collateral)
      const borrowAmount = iterationAmount * 0.9; // 90% LTV

      steps.push({
        step: stepNumber++,
        type: 'BORROW',
        agent: 'HYDRATION',
        tokenOut: {
          assetId: '5',
          symbol: 'DOT',
          amount: Number(borrowAmount.toFixed(5)),
        },
      });

      iterationAmount = borrowAmount;
    }

    return steps;
  }

  private async parseVDOTLooping(
    amount: number,
    assetId: string,
    intent: string
  ): Promise<StrategyStepResponseDto[]> {
    const iterations = this.extractIterationsFromIntent(intent);
    const { inputToken } = this.extractInputTokenFromIntent(intent);

    const steps: StrategyStepResponseDto[] = [];
    let stepNumber = 1;

    // Enable E-Mode
    steps.push({
      step: stepNumber++,
      type: 'ENABLE_E_MODE',
      agent: 'HYDRATION',
    });

    let currentAmount = amount;
    let currentToken = inputToken;

    // If starting token is not DOT, swap to DOT first
    if (inputToken !== 'DOT') {
      const dotAmount = this.estimateSwapAmount(inputToken, 'DOT', currentAmount);
      
      steps.push({
        step: stepNumber++,
        type: 'SWAP',
        agent: 'HYDRATION',
        tokenIn: {
          assetId: this.getAssetIdBySymbol(inputToken),
          symbol: inputToken,
          amount: Number(currentAmount.toFixed(5)),
        },
        tokenOut: {
          assetId: '5',
          symbol: 'DOT',
          amount: Number(dotAmount.toFixed(5)),
        },
      });

      currentAmount = dotAmount;
      currentToken = 'DOT';
    }

    let iterationAmount = currentAmount;

    for (let i = 0; i < iterations; i++) {
      // Swap DOT -> vDOT
      const vdotAmount = iterationAmount * 0.95; // Approximate conversion rate

      steps.push({
        step: stepNumber++,
        type: 'SWAP',
        agent: 'HYDRATION',
        tokenIn: {
          assetId: '5',
          symbol: 'DOT',
          amount: Number(iterationAmount.toFixed(5)),
        },
        tokenOut: {
          assetId: '18',
          symbol: 'VDOT',
          amount: Number(vdotAmount.toFixed(5)),
        },
      });

      // Supply vDOT
      steps.push({
        step: stepNumber++,
        type: 'SUPPLY',
        agent: 'HYDRATION',
        tokenIn: {
          assetId: '18',
          symbol: 'VDOT',
          amount: Number(vdotAmount.toFixed(5)),
        },
      });

      // Borrow DOT
      const borrowAmount = iterationAmount * 0.9; // 90% LTV

      steps.push({
        step: stepNumber++,
        type: 'BORROW',
        agent: 'HYDRATION',
        tokenOut: {
          assetId: '5',
          symbol: 'DOT',
          amount: Number(borrowAmount.toFixed(5)),
        },
      });

      iterationAmount = borrowAmount;
    }

    return steps;
  }

  private async parseCustomStrategy(
    intent: string,
    inputToken: { symbol: string; amount: number; assetId?: string }
  ): Promise<StrategyStepResponseDto[]> {
    const steps: StrategyStepResponseDto[] = [];
    let stepNumber = 1;
    const assetId = inputToken.assetId || this.getAssetIdBySymbol(inputToken.symbol);

    // Parse individual operations from intent
    const operations = this.extractOperationsFromIntent(intent, inputToken);

    for (const op of operations) {
      if (op.type === 'swap') {
        steps.push({
          step: stepNumber++,
          type: 'SWAP',
          agent: 'HYDRATION',
          tokenIn: {
            assetId: assetId,
            symbol: inputToken.symbol,
            amount: op.amount || inputToken.amount,
          },
          tokenOut: {
            assetId: op.tokenOutId || '18',
            symbol: op.tokenOutSymbol || 'VDOT',
            amount: op.amountOut || (inputToken.amount * 0.95),
          },
        });
      } else if (op.type === 'supply') {
        steps.push({
          step: stepNumber++,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: {
            assetId: assetId,
            symbol: inputToken.symbol,
            amount: op.amount || inputToken.amount,
          },
        });
      } else if (op.type === 'borrow') {
        steps.push({
          step: stepNumber++,
          type: 'BORROW',
          agent: 'HYDRATION',
          tokenOut: {
            assetId: op.tokenOutId || '5',
            symbol: op.tokenOutSymbol || 'DOT',
            amount: op.amount || (inputToken.amount * 0.9),
          },
        });
      }
    }

    return steps;
  }

  private extractIterationsFromIntent(intent: string): number {
    // Extract iterations from patterns like "3 times", "5 loops", "1 loop", "iterate 4"
    const iterMatch = intent.match(/(\d+)\s*(times?|loops?|iterations?)/i);
    if (iterMatch) return parseInt(iterMatch[1]);

    // Check for "3x", "5x" pattern
    const xMatch = intent.match(/(\d+)x/i);
    if (xMatch) return parseInt(xMatch[1]);

    // Risk-based defaults
    if (intent.includes('aggressive') || intent.includes('maximum') || intent.includes('high')) return 5;
    if (intent.includes('conservative') || intent.includes('safe') || intent.includes('low')) return 2;
    if (intent.includes('moderate')) return 3;

    return 3; // Default 3 iterations
  }

  private extractOperationsFromIntent(
    intent: string,
    inputToken: { symbol: string; amount: number; assetId?: string }
  ): Array<{
    type: string;
    amount: number;
    tokenInId?: string;
    tokenOutId?: string;
    tokenInSymbol?: string;
    tokenOutSymbol?: string;
    amountOut?: number;
  }> {
    const operations: Array<{
      type: string;
      amount: number;
      tokenInId?: string;
      tokenOutId?: string;
      tokenInSymbol?: string;
      tokenOutSymbol?: string;
      amountOut?: number;
    }> = [];

    // Simple pattern matching for operations
    if (intent.includes('swap')) {
      operations.push({
        type: 'swap',
        amount: inputToken.amount,
      });
    }

    if (intent.includes('supply') || intent.includes('deposit')) {
      operations.push({
        type: 'supply',
        amount: inputToken.amount,
      });
    }

    if (intent.includes('borrow')) {
      operations.push({
        type: 'borrow',
        amount: inputToken.amount * 0.9, // Conservative 90% of input
      });
    }

    return operations;
  }

  private estimateSwapAmount(tokenIn: string, tokenOut: string, amountIn: number): number {
    // Simple estimation based on common conversion rates
    // In production, this should call actual price oracle
    
    if (tokenIn === 'USDC' && tokenOut === 'DOT') {
      // Assume 1 USDC = 0.15 DOT (approximate)
      return amountIn * 0.15;
    }
    if (tokenIn === 'USDT' && tokenOut === 'DOT') {
      // Assume 1 USDT = 0.15 DOT (approximate)
      return amountIn * 0.15;
    }
    if (tokenIn === 'DOT' && tokenOut === 'USDC') {
      // Assume 1 DOT = 6.67 USDC (approximate)
      return amountIn * 6.67;
    }
    if (tokenIn === 'DOT' && tokenOut === 'USDT') {
      // Assume 1 DOT = 6.67 USDT (approximate)
      return amountIn * 6.67;
    }
    if (tokenIn === 'DOT' && tokenOut === 'VDOT') {
      return amountIn * 0.95;
    }
    if (tokenIn === 'DOT' && tokenOut === 'GDOT') {
      return amountIn * 0.929;
    }
    if (tokenIn === 'VDOT' && tokenOut === 'DOT') {
      return amountIn * 1.05;
    }
    if (tokenIn === 'GDOT' && tokenOut === 'DOT') {
      return amountIn * 1.076;
    }
    
    // Default: assume 1:1 ratio with 1% slippage
    return amountIn * 0.99;
  }

  private createSimpleSupplyStrategy(
    inputToken: { symbol: string; amount: number; assetId?: string }
  ): StrategyStepResponseDto[] {
    const assetId = inputToken.assetId || this.getAssetIdBySymbol(inputToken.symbol);
    
    return [
      {
        step: 1,
        type: 'SUPPLY',
        agent: 'HYDRATION',
        tokenIn: {
          assetId: assetId,
          symbol: inputToken.symbol.toUpperCase(),
          amount: inputToken.amount,
        },
      },
    ];
  }
}