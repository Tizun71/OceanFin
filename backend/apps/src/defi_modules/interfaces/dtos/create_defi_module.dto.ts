import { IsBoolean, IsInt, IsString, IsUrl } from 'class-validator';

export class CreateDefiModuleDto {
  @IsString()
  name: string;

  @IsString()
  protocol: string;

  @IsString()
  category: string;

  @IsInt()
  parachain_id: number;

  @IsUrl()
  icon_url: string;

  @IsString()
  description: string;

  @IsUrl()
  website_url: string;

  @IsBoolean()
  is_active: boolean;
}
