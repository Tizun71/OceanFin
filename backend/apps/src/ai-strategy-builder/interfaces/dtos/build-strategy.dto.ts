import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class BuildStrategyDto {
  @ApiProperty({
    description: 'User intent/goal for the DeFi strategy',
    example: 'I want to maximize yield with moderate risk',
    examples: [
      'I want to maximize yield with moderate risk',
      'Create a safe looping strategy for steady returns',
      'Build an aggressive leverage strategy for high APY',
      'I need a conservative strategy with low liquidation risk',
      'Generate maximum returns with my DOT holdings',
      'Create a diversified strategy across multiple protocols',
      'I want to build a strategy like this: 1. Supply DOT, 2. Borrow USDC, 3. Supply USDC',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  userIntent: string;

  @ApiProperty({
    description: 'Additional context or constraints (optional)',
    example: 'Avoid high-risk protocols, prefer established ones',
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalContext?: string;
}
