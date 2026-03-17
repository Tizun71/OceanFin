import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';
import { StrategyConstraintsService, StrategyConstraints } from './strategy-constraints.service';

@Injectable()
export class GeminiAiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private readonly constraintsService: StrategyConstraintsService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });
  }

  async generateStrategySteps(
    userIntent: string,
    additionalContext?: string
  ): Promise<StrategyStepResponseDto[]> {
    // Extract input token from user intent
    const { inputToken, defaultAmount } = this.extractInputTokenFromIntent(userIntent);
    
    // Get actual constraints from database
    const constraints = await this.constraintsService.getStrategyConstraints(
      inputToken,
      userIntent,
      additionalContext
    );

    const prompt = this.buildConstrainedPrompt(userIntent, { symbol: inputToken, amount: defaultAmount }, constraints, additionalContext);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response from Gemini
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Fallback: try to parse the entire response as JSON
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Failed to parse Gemini response as JSON');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate strategy: ${error.message}`);
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

  private buildConstrainedPrompt(
    userIntent: string,
    inputToken: { symbol: string; amount: number; assetId?: string },
    constraints: StrategyConstraints,
    additionalContext?: string
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
      return `
You are a DeFi strategy expert for Polkadot ecosystem. Convert the structured step-by-step instructions into executable DeFi strategy steps.

USER STRUCTURED STEPS:
${userIntent}

INPUT TOKEN: ${inputToken.amount} ${inputToken.symbol} (assetId: ${constraints.inputToken.assetId})
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
7. Add ENABLE_E_MODE if borrowing operations exist
8. ONLY use operations and tokens listed above

CRITICAL RULES:
1. ONLY use operations listed in "AVAILABLE OPERATIONS" above
2. ONLY use tokens listed in "SUPPORTED TOKENS" above  
3. Agent is always "HYDRATION" for all operations
4. Step numbers must be sequential starting from 1

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

STRATEGY GENERATION LOGIC:
1. Start with ENABLE_E_MODE if borrowing operations are available
2. Use available SWAP/JOIN_STRATEGY operations for the input token
3. Use available SUPPLY operations for collateral
4. Use available BORROW operations for leverage
5. Respect leverage limits and create realistic amounts

OPERATION TYPES EXPLANATION:
- SWAP: Direct token exchange
- JOIN_STRATEGY: Join liquid staking (e.g., DOT → gDOT)
- SUPPLY: Provide tokens as collateral
- BORROW: Borrow tokens against collateral
- ENABLE_E_MODE: Enable efficiency mode for better rates

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