import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeminiAiService } from '../application/gemini-ai.service';
import { AnalyzeRiskDto } from './dtos/analyze-risk.dto';
import { OptimizeStrategyDto } from './dtos/optimize-strategy.dto';

@ApiTags('AI Strategy Builder - Advanced')
@Controller('ai-strategy-builder/advanced')
export class AiStrategyBuilderAdvancedController {
  constructor(private readonly geminiAi: GeminiAiService) {}

  @Post('analyze-risk')
  @ApiOperation({
    summary: 'Analyze strategy risk using Gemini AI',
    description: 'Get detailed risk analysis and recommendations for a strategy',
  })
  @ApiResponse({
    status: 201,
    description: 'Risk analysis completed',
  })
  async analyzeRisk(@Body() dto: AnalyzeRiskDto) {
    return this.geminiAi.analyzeStrategyRisk(dto.steps);
  }

  @Post('optimize')
  @ApiOperation({
    summary: 'Optimize strategy using Gemini AI',
    description: 'Get optimized version of strategy with improvements',
  })
  @ApiResponse({
    status: 201,
    description: 'Strategy optimization completed',
  })
  async optimizeStrategy(@Body() dto: OptimizeStrategyDto) {
    return this.geminiAi.optimizeStrategy(dto.steps);
  }
}