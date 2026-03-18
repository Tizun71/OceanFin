import { Injectable } from '@nestjs/common';
import { StrategyStepResponseDto } from '../interfaces/dtos/strategy-step-response.dto';

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  apy: number; // Annual Percentage Yield
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  loopCount: number;
  steps: StrategyStepResponseDto[];
  tags: string[];
}

@Injectable()
export class StrategyTemplatesService {
  private templates: StrategyTemplate[] = [
    {
      id: 'simple-supply-usdc',
      name: 'Simple USDC Supply',
      description: 'Basic USDC supply strategy',
      apy: 5.2,
      riskLevel: 'LOW',
      loopCount: 0,
      steps: [
        {
          step: 1,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '22', symbol: 'USDC', amount: 100 }
        }
      ],
      tags: ['supply', 'stable', 'low-risk']
    },
    {
      id: 'usdc-dot-leverage-2x',
      name: 'USDC-DOT Leverage 2x',
      description: 'Supply USDC, borrow DOT with 2 loops',
      apy: 12.8,
      riskLevel: 'MEDIUM',
      loopCount: 2,
      steps: [
        {
          step: 1,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '22', symbol: 'USDC', amount: 100 }
        },
        {
          step: 2,
          type: 'BORROW',
          agent: 'HYDRATION',
          tokenOut: { assetId: '5', symbol: 'DOT', amount: 70 }
        },
        {
          step: 3,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '5', symbol: 'DOT', amount: 70 }
        },
        {
          step: 4,
          type: 'BORROW',
          agent: 'HYDRATION',
          tokenOut: { assetId: '22', symbol: 'USDC', amount: 49 }
        }
      ],
      tags: ['leverage', 'moderate-risk', 'yield-farming']
    },
    {
      id: 'usdc-dot-leverage-3x',
      name: 'USDC-DOT Leverage 3x',
      description: 'Supply USDC, borrow DOT with 3 loops',
      apy: 18.5,
      riskLevel: 'MEDIUM',
      loopCount: 3,
      steps: [
        {
          step: 1,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '22', symbol: 'USDC', amount: 100 }
        },
        {
          step: 2,
          type: 'BORROW',
          agent: 'HYDRATION',
          tokenOut: { assetId: '5', symbol: 'DOT', amount: 70 }
        },
        {
          step: 3,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '5', symbol: 'DOT', amount: 70 }
        },
        {
          step: 4,
          type: 'BORROW',
          agent: 'HYDRATION',
          tokenOut: { assetId: '22', symbol: 'USDC', amount: 49 }
        },
        {
          step: 5,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '22', symbol: 'USDC', amount: 49 }
        },
        {
          step: 6,
          type: 'BORROW',
          agent: 'HYDRATION',
          tokenOut: { assetId: '5', symbol: 'DOT', amount: 34 }
        }
      ],
      tags: ['leverage', 'moderate-risk', 'yield-farming']
    },
    {
      id: 'gdot-liquid-staking',
      name: 'GDOT Liquid Staking',
      description: 'DOT to GDOT liquid staking strategy',
      apy: 15.3,
      riskLevel: 'MEDIUM',
      loopCount: 1,
      steps: [
        {
          step: 1,
          type: 'ENABLE_E_MODE',
          agent: 'HYDRATION'
        },
        {
          step: 2,
          type: 'JOIN_STRATEGY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '5', symbol: 'DOT', amount: 100 },
          tokenOut: { assetId: '18', symbol: 'GDOT', amount: 98 }
        },
        {
          step: 3,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '18', symbol: 'GDOT', amount: 98 }
        }
      ],
      tags: ['liquid-staking', 'gdot', 'moderate-risk']
    },
    {
      id: 'aggressive-leverage-5x',
      name: 'Aggressive Leverage 5x',
      description: 'High leverage strategy with 5 loops',
      apy: 28.7,
      riskLevel: 'HIGH',
      loopCount: 5,
      steps: [
        {
          step: 1,
          type: 'SUPPLY',
          agent: 'HYDRATION',
          tokenIn: { assetId: '22', symbol: 'USDC', amount: 100 }
        },
        // ... more steps for 5x leverage
      ],
      tags: ['high-leverage', 'high-risk', 'aggressive']
    }
  ];

  getAllTemplates(): StrategyTemplate[] {
    return this.templates;
  }

  getTemplatesByRiskLevel(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): StrategyTemplate[] {
    return this.templates.filter(template => template.riskLevel === riskLevel);
  }

  getHighestYieldTemplate(
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH',
    maxLoops?: number
  ): StrategyTemplate | null {
    let filteredTemplates = this.templates;

    if (riskLevel) {
      filteredTemplates = filteredTemplates.filter(t => t.riskLevel === riskLevel);
    }

    if (maxLoops !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.loopCount <= maxLoops);
    }

    if (filteredTemplates.length === 0) {
      return null;
    }

    // Sort by APY descending and return the highest
    return filteredTemplates.sort((a, b) => b.apy - a.apy)[0];
  }

  getTemplatesByInputToken(tokenSymbol: string): StrategyTemplate[] {
    return this.templates.filter(template => 
      template.steps.some(step => 
        step.tokenIn?.symbol?.toUpperCase() === tokenSymbol.toUpperCase()
      )
    );
  }

  adaptTemplateToToken(
    template: StrategyTemplate, 
    inputToken: string, 
    amount: number
  ): StrategyStepResponseDto[] {
    // Clone the template steps
    const adaptedSteps = JSON.parse(JSON.stringify(template.steps));

    // Update the first step with the input token and amount
    const firstStepWithToken = adaptedSteps.find(step => step.tokenIn);
    if (firstStepWithToken && firstStepWithToken.tokenIn) {
      firstStepWithToken.tokenIn.symbol = inputToken.toUpperCase();
      firstStepWithToken.tokenIn.amount = amount;
      
      // Update asset ID based on token
      const assetMap: { [key: string]: string } = {
        'DOT': '5',
        'USDC': '22',
        'USDT': '10',
        'GDOT': '18',
        'VDOT': '19'
      };
      firstStepWithToken.tokenIn.assetId = assetMap[inputToken.toUpperCase()] || '5';
    }

    return adaptedSteps;
  }

  getRiskLevelFromLoops(loopCount: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (loopCount === 0) return 'LOW';
    if (loopCount <= 3) return 'MEDIUM';
    return 'HIGH';
  }

  getMaxLoopsForRisk(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (riskLevel) {
      case 'LOW': return 0;
      case 'MEDIUM': return 3;
      case 'HIGH': return 10;
      default: return 3;
    }
  }
}