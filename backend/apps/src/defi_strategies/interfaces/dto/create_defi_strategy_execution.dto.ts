import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateDefiStrategyExecutionDto {
  @ApiProperty({ example: 'uuid-strategy-version-id' })
  @IsString()
  strategy_version_id: string;

  @ApiProperty({ example: '0xdeadbeef' })
  @IsString()
  extrinsic_hash: string;

  @ApiProperty({ example: 'SUCCESS' })
  @IsString()
  execution_status: string;

  @ApiProperty({ example: 'workflow-hash', required: false })
  @IsOptional()
  @IsString()
  workflow_hash?: string;
}
