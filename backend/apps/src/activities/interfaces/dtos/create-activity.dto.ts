import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ description: 'User wallet address' })
  @IsString()
  userAddress: string;

  @ApiProperty({ description: 'Strategy ID (from strategies table)' })
  @IsString()
  strategyId: string;

  @ApiProperty({ description: 'Initial capital (stored in metadata)', example: '1000' })
  @IsString()
  initialCapital: string;

  @ApiProperty({ description: 'Total steps of the process', example: 8 })
  @IsInt()
  @Min(1)
  totalSteps: number;

  @ApiProperty({ description: 'Start at current step', example: 1 })
  @IsInt()
  @Min(1)
  currentStep: number;
}
