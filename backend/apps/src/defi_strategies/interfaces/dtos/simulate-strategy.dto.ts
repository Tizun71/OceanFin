import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class SimulateStrategyDto {
  @ApiProperty({
    description: 'Input amount to simulate',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount_in: number;

  @ApiPropertyOptional({
    description: 'Slippage tolerance in percentage',
    example: 0.5,
    default: 0.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  slippage_tolerance?: number;

  @ApiPropertyOptional({
    description: 'Gas price in gwei',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  gas_price?: number;
}
