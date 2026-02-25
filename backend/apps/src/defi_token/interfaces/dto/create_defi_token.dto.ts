import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDefiTokenDto {
  @ApiProperty({ description: 'The name of the DeFi token' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The asset ID associated with the DeFi token' })
  @IsNumber()
  asset_id: number;
}
