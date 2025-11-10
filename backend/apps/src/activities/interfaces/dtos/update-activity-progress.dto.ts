import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, IsIn, IsOptional } from 'class-validator';

export class UpdateActivityProgressDto {
  @ApiProperty({ description: 'Current step (1..8)', minimum: 1 })
  @IsInt()
  @Min(1)
  step: number;

  @ApiProperty({ description: 'Progress status', enum: ['PENDING', 'FAILED', 'SUCCESS'] })
  @IsIn(['PENDING', 'FAILED', 'SUCCESS'])
  status: 'PENDING' | 'FAILED' | 'SUCCESS';

  @ApiPropertyOptional({ 
    description: 'Transaction hash for this step. Can be a string (e.g., "123") or an array of strings (e.g., ["123", "456"]).', 
    oneOf: [
      { type: 'string', example: '123' },
      { type: 'array', items: { type: 'string' }, example: ['123', '456'] }
    ]
  })
  @IsOptional()
  txHash?: string | string[];
}