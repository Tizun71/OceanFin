import { IsBoolean, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDefiModuleActionDto {
  @ApiProperty({ description: 'ID of the DeFi module' })
  @IsString()
  module_id: string;

  @ApiProperty({ description: 'Name of the DeFi module action' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Pallet associated with the action' })
  @IsString()
  pallet: string;

  @ApiProperty({ description: 'Call associated with the action' })
  @IsString()
  call: string;

  @ApiProperty({ description: 'Description of the DeFi module action' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Parameter schema for the action' })
  @IsObject()
  param_schema: object;

  @ApiProperty({ description: 'Risk level of the action' })
  @IsString()
  risk_level: string;

  @ApiProperty({ description: 'Indicates if the action is active' })
  @IsBoolean()
  is_active: boolean;
}
