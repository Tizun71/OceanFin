import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdateDefiStrategyVersionDto {
  @ApiProperty({
    description: 'Workflow JSON describing the strategy',
    example: { nodes: [] },
    required: false,
  })
  @IsObject()
  @IsOptional()
  workflow_json?: object;

  @ApiProperty({
    description: 'Hash of the workflow to detect changes',
    example: 'abc123',
    required: false,
  })
  @IsString()
  @IsOptional()
  workflow_hash?: string;

  @ApiProperty({
    description: 'The state from react-flow to restore the graph UI',
    required: false,
  })
  @IsObject()
  @IsOptional()
  workflow_graph?: object;
}
