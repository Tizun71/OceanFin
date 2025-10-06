import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The wallet address of the user',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsNotEmpty({ message: 'Wallet address is required' })
  @IsString({ message: 'Wallet address must be a string' })
  walletAddress: string;

  @ApiProperty({
    description: 'The chain ID where the user is registered',
    example: 1,
  })
  @IsNotEmpty({ message: 'Chain ID is required' })
  @IsNumber({}, { message: 'Chain ID must be a number' })
  chainId: number;

  @ApiPropertyOptional({
    description: 'The display name of the user',
    example: 'Alice',
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  username?: string;
}
