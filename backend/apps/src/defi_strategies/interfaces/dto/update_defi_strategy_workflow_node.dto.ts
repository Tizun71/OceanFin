import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsObject } from 'class-validator';

export class UpdateDefiStrategyWorkflowNodeDto {
  @ApiProperty({ example: 'module-action-id', required: false })
  @IsOptional()
  @IsString()
  module_action_id?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  node_index?: number;

  @ApiProperty({ example: { x: 0, y: 0 }, required: false })
  @IsOptional()
  @IsObject()
  ui_position?: object;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsObject()
  params?: object;
}
