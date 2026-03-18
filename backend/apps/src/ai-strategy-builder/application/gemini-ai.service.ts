import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';
import { StrategyConstraintsService, StrategyConstraints } from './strategy-constraints.service';
import { StrategyTemplatesService } from './strategy-templates.service';
import { 
  GeminiApiException, 
  GeminiRateLimitException, 
  GeminiAuthException, 
  GeminiQuotaException, 
  GeminiParsingException 
} from '../../common/exceptions/gemini-api.exception';

@Injectable()
export class GeminiAiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private readonly constraintsService: StrategyConstraintsService,
              private readonly templatesService: StrategyTemplatesService) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Initializing GeminiAiService with API key:', apiKey);
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    // Log API key info for debugging (only first/last few chars)
    console.log('Gemini API Key loaded:', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));
    console.log('API Key length:', apiKey.length);
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      // generationConfig: {
      //   temperature: 0.1,
      //   topK: 1,
      //   topP: 0.8,
      //   maxOutputTokens: 2048,
      // },
    });
  }

  async generateStrategySteps(
    userIntent: string,
    additionalContext?: string,
    tokenAmount?: number
  ): Promise<StrategyStepResponseDto[]> {
    console.log('GenerateStrategySteps called with:', {
      userIntent,
      additionalContext,
      tokenAmount,
    });

    // Check if this is a "maximize yield" request
    if (this.isMaximizeYieldRequest(userIntent)) {
      return this.generateMaximizeYieldStrategy(userIntent, additionalContext, tokenAmount);
    }

    // Extract input token from user intent
    const { inputToken, defaultAmount } = this.extractInputTokenFromIntent(userIntent);
    const finalAmount = tokenAmount || defaultAmount; // Use provided amount or default
    
    console.log('Token amounts:', {
      tokenAmount,
      defaultAmount,
      finalAmount,
    });
    const loopCount = this.extractLoopCount(userIntent);
    const initialToken = this.extractInitialTokenFromContext(additionalContext);
    const swapInfo = this.needsInitialSwap(userIntent, additionalContext);
    const needsEMode = this.shouldAddEnableEMode(userIntent);
    
    // Get actual constraints from database
    const constraints = await this.constraintsService.getStrategyConstraints(
      inputToken,
      userIntent,
      additionalContext
    );

    const prompt = this.buildConstrainedPrompt(
      userIntent, 
      { symbol: inputToken, amount: finalAmount }, 
      constraints, 
      additionalContext, 
      loopCount,
      initialToken,
      swapInfo,
      needsEMode
    );
    
    // Retry logic with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any;
    
    while (retryCount <= maxRetries) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("AI Response Text:", text);
        
        if (!text || text.trim().length === 0) {
          throw new Error('Gemini returned empty response');
        }
        
        // Parse JSON response from Gemini
        let steps: StrategyStepResponseDto[];
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            steps = JSON.parse(jsonMatch[1]);
          } catch (parseError) {
            throw new Error(`Failed to parse JSON from Gemini response: ${parseError.message}`);
          }
        } else {
          // Fallback: try to parse the entire response as JSON
          try {
            steps = JSON.parse(text);
          } catch (parseError) {
            throw new Error(`Gemini response is not valid JSON. Response: ${text.substring(0, 200)}...`);
          }
        }
        
        if (!Array.isArray(steps) || steps.length === 0) {
          throw new Error('Gemini returned invalid strategy steps (not an array or empty)');
        }
        
        // Post-processing: Remove ENABLE_E_MODE from simple supply/borrow strategies
        steps = this.filterInvalidEnableEMode(steps, userIntent);
        
        // Post-processing: Add initial SWAP step if needed
        steps = this.addInitialSwapIfNeeded(steps, userIntent, additionalContext);
        
        return steps;
      } catch (error) {
        console.error(`Gemini API error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
        lastError = error;
        
        // Check if it's a rate limit error
        const isRateLimit = error.status === 429 || 
                           error.message?.includes('429') || 
                           error.message?.includes('Too Many Requests');
        
        if (isRateLimit && retryCount < maxRetries) {
          // Exponential backoff: 2^retryCount seconds
          const delaySeconds = Math.pow(2, retryCount);
          console.log(`Rate limit hit, retrying in ${delaySeconds} seconds...`);
          
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          retryCount++;
          continue;
        }
        
        // If not rate limit or max retries reached, break and throw
        break;
      }
    }
    
    // If we get here, all retries failed
    const error = lastError;
    
    // Log full error details for debugging (server-side only)
    console.error('Full Gemini error details:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      errorDetails: error.errorDetails,
    });
    
    // Throw concise exceptions for client
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      throw new GeminiRateLimitException('Rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 401 || error.message?.includes('API key')) {
      throw new GeminiAuthException('API authentication failed.');
    } else if (error.status === 403 || error.message?.includes('quota')) {
      throw new GeminiQuotaException('API quota exceeded. Please try again later.');
    } else if (error.message?.includes('timeout')) {
      throw new GeminiApiException('Request timeout. Please try again.', 408);
    } else if (error.message?.includes('Failed to parse') || 
               error.message?.includes('empty response') || 
               error.message?.includes('not valid JSON') || 
               error.message?.includes('invalid strategy steps')) {
      throw new GeminiParsingException('AI response parsing failed. Please try again.');
    } else {
      throw new GeminiApiException('AI service temporarily unavailable.');
    }
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

  private extractLoopCount(input: string): number {
    // Extract iterations from patterns like "3 times", "5 loops", "1 loop", "iterate 4"
    const iterMatch = input.match(/(\d+)\s*(times?|loops?|iterations?)/i);
    if (iterMatch) return parseInt(iterMatch[1]);

    // Check for "3x", "5x" pattern
    const xMatch = input.match(/(\d+)x/i);
    if (xMatch) return parseInt(xMatch[1]);

    // Check for "with 3 loop" pattern
    const withLoopMatch = input.match(/with\s+(\d+)\s+loops?/i);
    if (withLoopMatch) return parseInt(withLoopMatch[1]);

    return 3; // Default 3 iterations
  }

  private extractInitialTokenFromContext(additionalContext?: string): string | undefined {
    if (!additionalContext) return undefined;
    
    const initialTokenMatch = additionalContext.match(/initial\s+token\s+is\s+(DOT|VDOT|GDOT|USDT|USDC)/i);
    return initialTokenMatch ? initialTokenMatch[1].toUpperCase() : undefined;
  }

  private shouldAddEnableEMode(userIntent: string): boolean {
    // Check if user explicitly mentions enable e mode
    const explicitEMode = /enable\s+e\s*mode/i.test(userIntent);
    
    // Check if strategy explicitly mentions JOIN_STRATEGY operations (GDOT/VDOT liquid staking)
    const hasJoinStrategy = /join.*(?:gdot|vdot).*strategy|(?:gdot|vdot).*strategy|join.*strategy.*(?:gdot|vdot)/i.test(userIntent);
    
    // Check if it's a simple supply/borrow strategy (should NOT have ENABLE_E_MODE)
    const isSimpleSupplyBorrow = /^\s*(?:\d+\.\s*)?(?:supply|lend).*(?:borrow|loan)/i.test(userIntent.trim()) && 
                                !hasJoinStrategy && 
                                !explicitEMode;
    
    // ENABLE_E_MODE is FORBIDDEN for simple supply/borrow strategies
    if (isSimpleSupplyBorrow) {
      return false;
    }
    
    return explicitEMode || hasJoinStrategy;
  }

  private needsInitialSwap(userIntent: string, additionalContext?: string): { needsSwap: boolean; fromToken: string; toToken: string } {
    const initialToken = this.extractInitialTokenFromContext(additionalContext);
    if (!initialToken) return { needsSwap: false, fromToken: '', toToken: '' };

    // Extract the first token mentioned in the strategy steps
    // Handle both structured format (1. Supply USDC) and natural language (Supply USDC and borrow DOT)
    const firstStepMatch = userIntent.match(/(?:1\.\s*)?(?:supply|lend|swap|borrow|join)\s+(\w+)/i);
    if (!firstStepMatch) return { needsSwap: false, fromToken: '', toToken: '' };

    const firstStepToken = firstStepMatch[1].toUpperCase();
    
    // Check if initial token is different from first step token
    const needsSwap = initialToken.toUpperCase() !== firstStepToken;
    
    return {
      needsSwap,
      fromToken: initialToken.toUpperCase(),
      toToken: firstStepToken
    };
  }

  private filterInvalidEnableEMode(steps: StrategyStepResponseDto[], userIntent: string): StrategyStepResponseDto[] {
    // Check if strategy has JOIN_STRATEGY operations or explicit ENABLE_E_MODE request
    const hasJoinStrategy = steps.some(step => step.type === 'JOIN_STRATEGY');
    const explicitEMode = /enable\s+e\s*mode/i.test(userIntent);
    
    // If no JOIN_STRATEGY and no explicit request, remove ENABLE_E_MODE
    if (!hasJoinStrategy && !explicitEMode) {
      const filteredSteps = steps.filter(step => step.type !== 'ENABLE_E_MODE');
      
      // Renumber steps after filtering
      return filteredSteps.map((step, index) => ({
        ...step,
        step: index + 1
      }));
    }
    
    return steps;
  }

  private addInitialSwapIfNeeded(steps: StrategyStepResponseDto[], userIntent: string, additionalContext?: string): StrategyStepResponseDto[] {
    const initialToken = this.extractInitialTokenFromContext(additionalContext);
    if (!initialToken) {
      return steps;
    }
    
    // Find the first step that has tokenIn (skip ENABLE_E_MODE)
    const firstStepWithToken = steps.find(step => 
      step.type !== 'ENABLE_E_MODE' && step.tokenIn?.symbol
    );
    
    if (!firstStepWithToken || !firstStepWithToken.tokenIn) {
      return steps;
    }
    
    const firstStepToken = firstStepWithToken.tokenIn.symbol.toUpperCase();
    const needsSwap = initialToken.toUpperCase() !== firstStepToken;
    
    if (!needsSwap) {
      return steps;
    }
    
    // Check if SWAP step already exists at the beginning (after ENABLE_E_MODE if present)
    const enableEModeIndex = steps.findIndex(step => step.type === 'ENABLE_E_MODE');
    const expectedSwapIndex = enableEModeIndex >= 0 ? enableEModeIndex + 1 : 0;
    
    const hasInitialSwap = steps.length > expectedSwapIndex && 
                          steps[expectedSwapIndex].type === 'SWAP' && 
                          steps[expectedSwapIndex].tokenIn?.symbol === initialToken.toUpperCase() &&
                          steps[expectedSwapIndex].tokenOut?.symbol === firstStepToken;
    
    if (hasInitialSwap) {
      return steps;
    }
    
    // Get asset IDs for the tokens
    const fromAssetId = this.getAssetIdBySymbol(initialToken);
    const toAssetId = this.getAssetIdBySymbol(firstStepToken);
    
    // Estimate swap amount (use the amount from first step if available)
    const firstStepAmount = firstStepWithToken.tokenIn.amount || 10;
    
    // Create SWAP step
    const swapStep: StrategyStepResponseDto = {
      step: expectedSwapIndex + 1,
      type: 'SWAP',
      agent: 'HYDRATION',
      tokenIn: {
        assetId: fromAssetId,
        symbol: initialToken.toUpperCase(),
        amount: firstStepAmount
      },
      tokenOut: {
        assetId: toAssetId,
        symbol: firstStepToken,
        amount: firstStepAmount * 0.98 // Assume 2% slippage
      }
    };
    
    // Insert SWAP step at the correct position and renumber all subsequent steps
    const updatedSteps = [...steps];
    updatedSteps.splice(expectedSwapIndex, 0, swapStep);
    
    // Renumber all steps
    return updatedSteps.map((step, index) => ({
      ...step,
      step: index + 1
    }));
  }

  private getAssetIdBySymbol(symbol: string): string {
    const assetMap: { [key: string]: string } = {
      'DOT': '5',
      'USDC': '22',
      'USDT': '23',
      'GDOT': '18',
      'VDOT': '19',
      'BTC': '21',
      'ETH': '20'
    };
    
    return assetMap[symbol.toUpperCase()] || '5'; // Default to DOT
  }

  private isMaximizeYieldRequest(userIntent: string): boolean {
    const intent = userIntent.toLowerCase();
    return intent.includes('maximize yield') || 
           intent.includes('maximum yield') || 
           intent.includes('highest yield') ||
           intent.includes('best yield');
  }

  private async generateMaximizeYieldStrategy(
    userIntent: string,
    additionalContext?: string,
    tokenAmount?: number
  ): Promise<StrategyStepResponseDto[]> {
    // Extract input token and amount
    const { inputToken, defaultAmount } = this.extractInputTokenFromIntent(userIntent);
    const finalAmount = tokenAmount || defaultAmount;
    const initialToken = this.extractInitialTokenFromContext(additionalContext);
    
    // Determine risk level from user intent
    const riskLevel = this.extractRiskLevel(userIntent);
    const maxLoops = this.templatesService.getMaxLoopsForRisk(riskLevel);
    
    console.log(`Maximize yield request: token=${inputToken}, risk=${riskLevel}, maxLoops=${maxLoops}`);
    
    // Get the highest yield template that matches the criteria
    const bestTemplate = this.templatesService.getHighestYieldTemplate(riskLevel, maxLoops);
    
    if (!bestTemplate) {
      // Fallback to regular AI generation if no template found
      console.log('No suitable template found, falling back to AI generation');
      return this.generateRegularStrategy(userIntent, additionalContext);
    }
    
    console.log(`Selected template: ${bestTemplate.name} (APY: ${bestTemplate.apy}%)`);
    
    // Adapt the template to the input token
    const tokenToUse = initialToken || inputToken;
    let adaptedSteps = this.templatesService.adaptTemplateToToken(
      bestTemplate, 
      tokenToUse, 
      finalAmount
    );
    
    // Add initial SWAP step if needed
    adaptedSteps = this.addInitialSwapIfNeeded(adaptedSteps, userIntent, additionalContext);
    
    return adaptedSteps;
  }

  private extractRiskLevel(userIntent: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const intent = userIntent.toLowerCase();
    
    if (intent.includes('low risk') || intent.includes('conservative') || intent.includes('safe')) {
      return 'LOW';
    } else if (intent.includes('high risk') || intent.includes('aggressive') || intent.includes('risky')) {
      return 'HIGH';
    } else if (intent.includes('moderate risk') || intent.includes('medium risk') || intent.includes('balanced')) {
      return 'MEDIUM';
    }
    
    // Default to MEDIUM if no risk level specified
    return 'MEDIUM';
  }

  private async generateRegularStrategy(
    userIntent: string,
    additionalContext?: string,
    tokenAmount?: number
  ): Promise<StrategyStepResponseDto[]> {
    // This is the original logic for non-maximize-yield requests
    const { inputToken, defaultAmount } = this.extractInputTokenFromIntent(userIntent);
    const finalAmount = tokenAmount || defaultAmount;
    const loopCount = this.extractLoopCount(userIntent);
    const initialToken = this.extractInitialTokenFromContext(additionalContext);
    const swapInfo = this.needsInitialSwap(userIntent, additionalContext);
    const needsEMode = this.shouldAddEnableEMode(userIntent);
    
    const constraints = await this.constraintsService.getStrategyConstraints(
      inputToken,
      userIntent,
      additionalContext
    );

    const prompt = this.buildConstrainedPrompt(
      userIntent, 
      { symbol: inputToken, amount: finalAmount }, 
      constraints, 
      additionalContext, 
      loopCount,
      initialToken,
      swapInfo,
      needsEMode
    );
    
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let steps: StrategyStepResponseDto[];
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      steps = JSON.parse(jsonMatch[1]);
    } else {
      steps = JSON.parse(text);
    }
    
    steps = this.filterInvalidEnableEMode(steps, userIntent);
    steps = this.addInitialSwapIfNeeded(steps, userIntent, additionalContext);
    
    return steps;
  }

  private buildConstrainedPrompt(
    userIntent: string,
    inputToken: { symbol: string; amount: number; assetId?: string },
    constraints: StrategyConstraints,
    additionalContext?: string,
    loopCount?: number,
    initialToken?: string,
    swapInfo?: { needsSwap: boolean; fromToken: string; toToken: string },
    needsEMode?: boolean
  ): string {
    const availableOpsText = constraints.availableOperations
      .filter(op => op.supported)
      .map(op => {
        if (op.tokenIn && op.tokenOut) {
          return `- ${op.type}: ${op.tokenIn.symbol} (${op.tokenIn.assetId}) → ${op.tokenOut.symbol} (${op.tokenOut.assetId})`;
        } else if (op.tokenIn) {
          return `- ${op.type}: ${op.tokenIn.symbol} (${op.tokenIn.assetId})`;
        } else if (op.tokenOut) {
          return `- ${op.type}: → ${op.tokenOut.symbol} (${op.tokenOut.assetId})`;
        } else {
          return `- ${op.type}: Available`;
        }
      })
      .join('\n');

    const supportedTokensText = constraints.supportedTokens
      .map(token => `- ${token.symbol} (assetId: "${token.assetId}")`)
      .join('\n');

    // Check if input is structured steps format
    const isStructuredSteps = /^\s*\d+\.\s*\w+/m.test(userIntent);

    if (isStructuredSteps) {
      const swapInfo = this.needsInitialSwap(userIntent, additionalContext);
      const needsEMode = this.shouldAddEnableEMode(userIntent);
      
      return `
You are a DeFi strategy expert for Polkadot ecosystem. Convert the structured step-by-step instructions into executable DeFi strategy steps.

USER STRUCTURED STEPS:
${userIntent}

INPUT TOKEN: ${inputToken.amount} ${inputToken.symbol} (assetId: ${constraints.inputToken.assetId})
${initialToken ? `INITIAL TOKEN: ${initialToken}` : ''}
${swapInfo?.needsSwap ? `NEEDS INITIAL SWAP: ${swapInfo.fromToken} → ${swapInfo.toToken}` : ''}
${needsEMode ? `REQUIRES ENABLE_E_MODE: YES (GDOT/VDOT strategy or explicitly requested)` : `REQUIRES ENABLE_E_MODE: NO (simple supply/borrow strategy)`}
${additionalContext ? `ADDITIONAL CONTEXT: "${additionalContext}"` : ''}

CONSTRAINTS FROM DATABASE:
- Max Leverage: ${constraints.operationConstraints.maxLeverage}x
- Risk Level: ${constraints.operationConstraints.riskLevel}

AVAILABLE OPERATIONS FOR ${inputToken.symbol}:
${availableOpsText}

ALL SUPPORTED TOKENS:
${supportedTokensText}

TRANSLATION RULES:
1. "Lend" or "Supply" → SUPPLY operation
2. "Borrow" → BORROW operation  
3. "Swap" or "Exchange" → SWAP operation
4. "Join strategy" or "Stake" → JOIN_STRATEGY operation
5. Replace any non-Hydration protocols with HYDRATION
6. Convert percentages to actual amounts based on input token
7. ENABLE_E_MODE rules - CRITICAL:
   - ABSOLUTELY FORBIDDEN for simple supply/borrow strategies
   - ONLY add if strategy contains JOIN_STRATEGY operations (GDOT/VDOT liquid staking)
   - OR if user explicitly mentions "enable e mode" in their intent
   - NEVER add for basic lending strategies like "Supply X, Borrow Y"
   - If user intent is just supply and borrow operations → NO ENABLE_E_MODE
8. ONLY use operations and tokens listed above

INITIAL TOKEN HANDLING:
${swapInfo?.needsSwap ? `
- DETECTED: User starts with ${swapInfo.fromToken} but first step needs ${swapInfo.toToken}
- SYSTEM WILL AUTO-ADD: SWAP ${swapInfo.fromToken} to ${swapInfo.toToken} as step 1
- You can focus on the main strategy steps, the initial swap will be handled automatically
- Example: If user has USDT but strategy starts with "Supply USDC", system adds SWAP USDT→USDC automatically
` : 'No initial swap needed - starting token matches first step token or no initial token specified'}

CRITICAL RULES:
1. ONLY use operations listed in "AVAILABLE OPERATIONS" above
2. ONLY use tokens listed in "SUPPORTED TOKENS" above  
3. Agent is always "HYDRATION" for all operations
4. Step numbers must be sequential starting from 1
5. ENABLE_E_MODE rules - READ CAREFULLY:
   - ABSOLUTELY FORBIDDEN for simple supply/borrow strategies
   - ENABLE_E_MODE is ONLY allowed when:
     a) Strategy contains JOIN_STRATEGY operations (GDOT/VDOT liquid staking)
     b) User explicitly requests "enable e mode" in their intent
   - If this is just "Supply X and Borrow Y" → NEVER ADD ENABLE_E_MODE
   - If this is just "1. Supply USDC, 2. Borrow DOT" → NEVER ADD ENABLE_E_MODE
   - Examples that MUST NOT have ENABLE_E_MODE: "Supply USDC, Borrow DOT", "Supply DOT, Borrow USDC"
   - ENABLE_E_MODE is FORBIDDEN unless strategy involves liquid staking (JOIN_STRATEGY)
${swapInfo?.needsSwap ? `6. AUTOMATIC SWAP: System will auto-add SWAP ${swapInfo.fromToken} → ${swapInfo.toToken} as first step` : ''}

FORBIDDEN COMBINATIONS:
- ENABLE_E_MODE + only SUPPLY/BORROW operations (without JOIN_STRATEGY)
- ENABLE_E_MODE + simple lending strategies

Generate a JSON array of strategy steps using ONLY the available operations above.

Each step format:
{
  "step": number,
  "type": "OPERATION_TYPE", 
  "agent": "HYDRATION",
  "tokenIn": {
    "assetId": "string",
    "symbol": "string",
    "amount": number
  },
  "tokenOut": {
    "assetId": "string", 
    "symbol": "string",
    "amount": number
  }
}

Return ONLY the JSON array:
`;
    }

    return `
You are a DeFi strategy expert for Polkadot ecosystem. Create a strategy based on ACTUAL available operations from the database.

USER INPUT:
- Intent: "${userIntent}"
- Input Token: ${inputToken.amount} ${inputToken.symbol} (assetId: ${constraints.inputToken.assetId})
${initialToken ? `- Initial Token: ${initialToken}` : ''}
${swapInfo?.needsSwap ? `- Needs Initial Swap: ${swapInfo.fromToken} → ${swapInfo.toToken}` : ''}
${needsEMode ? `- Requires ENABLE_E_MODE: YES (GDOT/VDOT strategy or explicitly requested)` : `- Requires ENABLE_E_MODE: NO (simple supply/borrow strategy)`}
${loopCount ? `- Loop Count: ${loopCount} iterations` : ''}
${additionalContext ? `- Additional Context: "${additionalContext}"` : ''}

CONSTRAINTS FROM DATABASE:
- Max Leverage: ${constraints.operationConstraints.maxLeverage}x
- Risk Level: ${constraints.operationConstraints.riskLevel}

AVAILABLE OPERATIONS FOR ${inputToken.symbol}:
${availableOpsText}

ALL SUPPORTED TOKENS:
${supportedTokensText}

CRITICAL RULES:
1. ONLY use operations listed in "AVAILABLE OPERATIONS" above
2. ONLY use tokens listed in "SUPPORTED TOKENS" above
3. Respect the max leverage constraint (${constraints.operationConstraints.maxLeverage}x)
4. Match risk level to user intent (${constraints.operationConstraints.riskLevel})
5. Agent is always "HYDRATION" for all operations
6. Step numbers must be sequential starting from 1

LOOPING STRATEGY LOGIC:
If user mentions "loop", "loops", "leverage", or "multiply":
1. Extract number of loops from phrases like "3 loop", "5 loops", "2 times" (detected: ${loopCount || 3} loops)
2. Create a looping strategy with the specified iterations
3. Each loop should: Supply → Borrow → (repeat)
4. Use decreasing amounts for each iteration (e.g., 90% of previous amount)
5. For "Supply DOT and borrow USDC with 3 loop": Create 3 complete Supply+Borrow cycles

STRATEGY GENERATION LOGIC:
${swapInfo?.needsSwap ? `1. AUTOMATIC SWAP: System will auto-add SWAP ${swapInfo.fromToken} → ${swapInfo.toToken} as first step` : '1. Check if initial token differs from first step token - system will auto-add SWAP if needed'}
2. ENABLE_E_MODE rules - CRITICAL:
   - ABSOLUTELY FORBIDDEN for simple supply/borrow strategies
   - ONLY add if strategy contains JOIN_STRATEGY operations (GDOT/VDOT liquid staking)
   - OR if user explicitly mentions "enable e mode" in their intent
   - NEVER add for basic lending strategies
   - If user just wants to "Supply X and Borrow Y" → NO ENABLE_E_MODE
   - ENABLE_E_MODE is ONLY for liquid staking strategies or explicit requests
3. For looping strategies: Repeat Supply + Borrow for specified iterations
4. For simple strategies: Use available SWAP/JOIN_STRATEGY operations for the input token
5. Use available SUPPLY operations for collateral
6. Use available BORROW operations for leverage
7. Respect leverage limits and create realistic amounts

INITIAL TOKEN HANDLING:
${swapInfo?.needsSwap ? `
- DETECTED: User starts with ${swapInfo.fromToken} but first step needs ${swapInfo.toToken}
- SYSTEM WILL AUTO-ADD: SWAP ${swapInfo.fromToken} to ${swapInfo.toToken} as step 1
- You can focus on the main strategy steps, the initial swap will be handled automatically
- Example: If user has USDT but strategy starts with "Supply USDC", system adds SWAP USDT→USDC automatically
` : 'No initial swap needed - starting token matches first step token or no initial token specified'}

OPERATION TYPES EXPLANATION:
- SWAP: Direct token exchange
- JOIN_STRATEGY: Join liquid staking (e.g., DOT → gDOT, DOT → vDOT)
- SUPPLY: Provide tokens as collateral
- BORROW: Borrow tokens against collateral
- ENABLE_E_MODE: Enable efficiency mode (ONLY for GDOT/VDOT strategies OR when user explicitly requests it)

ENABLE_E_MODE RULES:
- ABSOLUTELY FORBIDDEN for simple supply/borrow strategies
- DO NOT add ENABLE_E_MODE unless:
  a) Strategy contains JOIN_STRATEGY operations (GDOT/VDOT liquid staking)
  b) User explicitly mentions "enable e mode" in their intent
- Examples that MUST NOT have ENABLE_E_MODE:
  * "Supply DOT and borrow USDC" → NO ENABLE_E_MODE
  * "Supply USDC and borrow DOT" → NO ENABLE_E_MODE
  * "1. Supply USDC, 2. Borrow DOT" → NO ENABLE_E_MODE
  * Any simple lending/borrowing → NO ENABLE_E_MODE
- Examples that NEED ENABLE_E_MODE:
  * "Join GDOT strategy" → YES ENABLE_E_MODE
  * "Enable e mode then supply" → YES ENABLE_E_MODE

EXAMPLE LOOPING STRATEGY for "Supply DOT and borrow USDC with 3 loop":
1. ENABLE_E_MODE
2. SUPPLY DOT (10 DOT)
3. BORROW USDC (9 USDC at 90% LTV)
4. SWAP USDC to DOT (get ~1.35 DOT)
5. SUPPLY DOT (1.35 DOT)
6. BORROW USDC (1.2 USDC)
7. SWAP USDC to DOT (get ~0.18 DOT)
8. SUPPLY DOT (0.18 DOT)
9. BORROW USDC (0.16 USDC)

Generate a JSON array of strategy steps using ONLY the available operations above.

Each step format:
{
  "step": number,
  "type": "OPERATION_TYPE",
  "agent": "HYDRATION",
  "tokenIn": {
    "assetId": "string",
    "symbol": "string", 
    "amount": number
  },
  "tokenOut": {
    "assetId": "string",
    "symbol": "string",
    "amount": number
  }
}

Return ONLY the JSON array:
`;
  }

  async analyzeStrategyRisk(steps: StrategyStepResponseDto[]): Promise<{
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
    recommendations: string[];
  }> {
    const prompt = `
Analyze the risk level of this DeFi strategy and provide recommendations:

STRATEGY STEPS:
${JSON.stringify(steps, null, 2)}

Analyze based on:
1. Number of borrowing operations (high leverage = high risk)
2. Token volatility (DOT, vDOT, gDOT volatility)
3. Liquidation risk from looping
4. Smart contract risks
5. Slippage risks

Return JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH",
  "riskFactors": ["factor1", "factor2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Risk analysis error:', error);
      // Fallback risk analysis
      const borrowSteps = steps.filter(s => s.type === 'BORROW').length;
      return {
        riskLevel: borrowSteps > 5 ? 'HIGH' : borrowSteps > 2 ? 'MEDIUM' : 'LOW',
        riskFactors: ['Unable to perform detailed risk analysis'],
        recommendations: ['Review strategy manually', 'Start with smaller amounts'],
      };
    }
  }

  async optimizeStrategy(steps: StrategyStepResponseDto[]): Promise<{
    optimizedSteps: StrategyStepResponseDto[];
    optimizations: string[];
  }> {
    const prompt = `
Optimize this DeFi strategy for better efficiency and lower risk:

CURRENT STRATEGY:
${JSON.stringify(steps, null, 2)}

Optimization goals:
1. Reduce gas costs by combining operations
2. Improve capital efficiency
3. Reduce liquidation risk
4. Optimize LTV ratios

Return JSON format:
{
  "optimizedSteps": [...], // Same format as input steps
  "optimizations": ["optimization1", "optimization2"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Strategy optimization error:', error);
      return {
        optimizedSteps: steps,
        optimizations: ['Unable to optimize strategy automatically'],
      };
    }
  }
}