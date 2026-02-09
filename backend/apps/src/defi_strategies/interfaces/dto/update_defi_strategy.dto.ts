import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class UpdateDefiStrategyDto {
  @ApiProperty({
    description: 'Human readable name',
    example: 'My Strategy',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description',
    example: 'Strategy description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Flag if strategy is public',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_public?: boolean;

  @ApiProperty({
    description: 'Status of the strategy',
    example: 'active',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Chain context (e.g. ethereum)',
    example: 'ethereum',
    required: false,
  })
  @IsString()
  @IsOptional()
  chain_context?: string;
}
