import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject } from 'class-validator';

export class CreateDefiStrategyWorkflowNodeDto {
  @ApiProperty({ example: 'uuid-strategy-version-id' })
  @IsString()
  strategy_version_id: string;

  @ApiProperty({ example: 'module-action-id' })
  @IsString()
  module_action_id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  node_index: number;

  @ApiProperty({ example: { x: 0, y: 0 } })
  @IsObject()
  ui_position: object;

  @ApiProperty({ example: {} })
  @IsObject()
  params: object;
}
