import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StrategyStepResponseDto } from './strategy-step-response.dto';

export class AnalyzeRiskDto {
  @ApiProperty({
    type: [StrategyStepResponseDto],
    description: 'Strategy steps to analyze for risk',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyStepResponseDto)
  steps: StrategyStepResponseDto[];
}