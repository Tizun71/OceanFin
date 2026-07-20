import {
  IsString,
  IsNumber,
  IsOptional,
  IsEthereumAddress,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDefiTokenDto {
  @ApiProperty({ description: 'The name of the DeFi token' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description:
      'Hydration asset id. Required for substrate tokens, omitted for EVM tokens (which are identified by address).',
  })
  @IsNumber()
  @IsOptional()
  asset_id?: number;

  @ApiPropertyOptional({
    description: "Chain slug the token lives on ('polkadot' | 'avalanche' | 'base' | 'arbitrum')",
    default: 'polkadot',
  })
  @IsString()
  @IsOptional()
  chain?: string;

  @ApiPropertyOptional({ description: 'EVM numeric chain id (43114 / 8453 / 42161)' })
  @IsNumber()
  @IsOptional()
  chain_id?: number;

  @ApiPropertyOptional({
    description:
      'ERC-20 contract address. Required for EVM tokens, must be omitted for substrate tokens.',
    example: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
  })
  @IsEthereumAddress({ message: 'address must be a valid Ethereum address' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'ERC-20 decimals (USDC 6, WETH 18). Required for EVM tokens.',
    example: 6,
  })
  @IsInt()
  @Min(0)
  @Max(36)
  @IsOptional()
  decimals?: number;
}
