import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDefiStrategyDto {
  @ApiProperty({
    description: 'Owner id of the strategy',
    example: 'user-uuid',
  })
  @IsString()
  owner_id: string;

  @ApiProperty({ description: 'Human readable name', example: 'My Strategy' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description', example: 'Strategy description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Flag if strategy is public', example: true })
  @IsBoolean()
  is_public: boolean;

  @ApiProperty({
    description: 'Chain context (e.g. ethereum)',
    example: 'ethereum',
  })
  @IsString()
  chain_context: string;

  @ApiProperty({ description: 'Optional status', example: 'draft' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Workflow JSON object' })
  @IsObject()
  workflow_json: object;

  @ApiProperty({ description: 'Workflow hash', example: 'hash-string' })
  @IsString()
  workflow_hash: string;

  @ApiProperty({ description: 'Workflow graph object' })
  @IsObject()
  workflow_graph: object;
}
