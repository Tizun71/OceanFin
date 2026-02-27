import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDefiActionRequiredDto {
  @ApiProperty({ description: 'ID of the action' })
  @IsString()
  action_id: string;

  @ApiProperty({ description: 'ID of the module' })
  @IsString()
  module_id: string;

  @ApiProperty({ description: 'ID of the required action' })
  @IsString()
  action_required_id: string;
}
