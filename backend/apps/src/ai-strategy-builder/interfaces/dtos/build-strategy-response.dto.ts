import { ApiProperty } from '@nestjs/swagger';
import { StrategyStepResponseDto } from './strategy-step-response.dto';

class ValidationResult {
  @ApiProperty({ example: true, description: 'Whether the strategy is valid' })
  isValid: boolean;

  @ApiProperty({
    example: [],
    description: 'List of validation errors',
    type: [String],
  })
  errors: string[];

  @ApiProperty({
    example: ['Strategy has high risk due to multiple borrow operations'],
    description: 'List of validation warnings',
    type: [String],
  })
  warnings: string[];
}

class StrategyMetadata {
  @ApiProperty({ example: 7, description: 'Total number of steps' })
  totalSteps: number;

  @ApiProperty({ example: 850000, description: 'Estimated gas cost' })
  estimatedGas: number;

  @ApiProperty({
    example: 'MEDIUM',
    description: 'Risk level of the strategy',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  })
  riskLevel: string;
}

export class BuildStrategyResponseDto {
  @ApiProperty({
    type: [StrategyStepResponseDto],
    description: 'List of executable strategy steps',
  })
  steps: StrategyStepResponseDto[];

  @ApiProperty({
    type: ValidationResult,
    description: 'Validation results for the strategy',
  })
  validation: ValidationResult;

  @ApiProperty({
    type: StrategyMetadata,
    description: 'Metadata about the strategy',
  })
  metadata: StrategyMetadata;
}
