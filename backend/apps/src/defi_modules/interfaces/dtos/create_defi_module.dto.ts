import { IsBoolean, IsInt, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDefiModuleDto {
  @ApiProperty({
    description: 'Human-readable name of the DeFi module',
    example: 'Acme Lending Pool',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Protocol associated with the DeFi module',
    example: 'Acme Protocol',
  })
  @IsString()
  protocol: string;

  @ApiProperty({
    description: 'Category of the DeFi module',
    example: 'Lending',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Parachain ID associated with the DeFi module',
    example: 1,
  })
  @IsInt()
  parachain_id: number;

  @ApiProperty({
    description: 'Icon URL of the DeFi module',
    example: 'https://example.com/icon.png',
  })
  @IsUrl()
  icon_url: string;

  @ApiProperty({
    description: 'Description of the DeFi module',
    example: 'A lending pool module for Acme Protocol',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Website URL of the DeFi module',
    example: 'https://acmeprotocol.com',
  })
  @IsUrl()
  website_url: string;

  @ApiProperty({
    description: 'Indicates if the DeFi module is active',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;
}
