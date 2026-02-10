import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateDefiStrategySimulationSnapshotDto {
  @ApiProperty({ example: 'uuid-strategy-version-id' })
  @IsString()
  strategy_version_id: string;

  @ApiProperty({ example: 'ESTIMATE' })
  @IsString()
  snapshot_type: string;

  @ApiProperty({ example: { out: [] } })
  @IsObject()
  estimated_outputs: object;

  @ApiProperty({ example: '0', required: false })
  @IsOptional()
  @IsString()
  estimated_weight?: string;

  @ApiProperty({ example: '0', required: false })
  @IsOptional()
  @IsString()
  estimated_fee?: string;

  @ApiProperty({ example: 'chain-state-ref', required: false })
  @IsOptional()
  @IsString()
  chain_state_ref?: string;
}
