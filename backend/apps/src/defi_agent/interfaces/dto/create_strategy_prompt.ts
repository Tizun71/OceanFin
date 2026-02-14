import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStrategyPromptDTO {
  @IsString()
  @ApiProperty({ description: 'User prompt for creating a DeFi strategy' })
  prompt: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Initial capital amount in the base asset (e.g., 100 for 100 DOT). If not provided, defaults to 100.',
    example: 100,
  })
  amount?: number;
}
