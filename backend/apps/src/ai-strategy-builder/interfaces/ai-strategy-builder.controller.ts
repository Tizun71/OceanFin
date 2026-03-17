import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiStrategyBuilderService } from '../application/ai-strategy-builder.service';
import { BuildStrategyDto } from './dtos/build-strategy.dto';
import { BuildStrategyResponseDto } from './dtos/build-strategy-response.dto';

@ApiTags('AI Strategy Builder')
@Controller('ai-strategy-builder')
export class AiStrategyBuilderController {
  constructor(private readonly aiStrategyBuilderService: AiStrategyBuilderService) {}

  @Post('build')
  @ApiOperation({
    summary: 'Build DeFi strategy from natural language',
    description:
      'Parse natural language input and generate executable strategy steps with validation',
  })
  @ApiResponse({
    status: 201,
    description: 'Strategy successfully built and validated',
    type: BuildStrategyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or strategy validation failed',
  })
  async buildStrategy(@Body() dto: BuildStrategyDto): Promise<BuildStrategyResponseDto> {
    return this.aiStrategyBuilderService.buildStrategy(dto);
  }
}
