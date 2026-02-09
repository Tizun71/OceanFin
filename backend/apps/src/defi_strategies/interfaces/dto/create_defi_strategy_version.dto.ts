import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class CreateDefiStrategyVersionDto {
  @ApiProperty({
    description: 'ID of the parent strategy',
    example: 'uuid-strategy-id',
  })
  @IsString()
  strategy_id: string;

  @ApiProperty({
    description: 'Workflow JSON describing the strategy',
    example: { nodes: [] },
  })
  @IsObject()
  workflow_json: object;

  @ApiProperty({
    description: 'Hash of the workflow to detect changes',
    example: 'abc123',
  })
  @IsString()
  workflow_hash: string;
}
