import { IsString, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExecutionStepResultDto {
  @ApiProperty({ description: 'The ID of the execution' })
  @IsString()
  execution_id: string;

  @ApiProperty({ description: 'The parachain id' })
  @IsNumber()
  parachain_id: number;

  @ApiProperty({ description: 'The pallet name' })
  @IsString()
  pallet: string;

  @ApiProperty({ description: 'The call name' })
  @IsString()
  call: string;

  @ApiProperty({ description: 'The step status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'The output assets' })
  @IsObject()
  output_assets: object;

  @ApiProperty({ description: 'The error message if any' })
  @IsString()
  error_message: string;
}
