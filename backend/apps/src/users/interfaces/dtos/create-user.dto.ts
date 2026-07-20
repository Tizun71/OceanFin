import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsISO8601 } from 'class-validator';

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

  @ApiProperty({
    description:
      'ISO-8601 timestamp embedded in the signed message. Must be within 5 minutes of server time.',
    example: '2026-07-18T08:15:00.000Z',
  })
  @IsNotEmpty({ message: 'issuedAt is required' })
  @IsISO8601({}, { message: 'issuedAt must be an ISO-8601 timestamp' })
  issuedAt: string;

  @ApiProperty({
    description:
      'EIP-191 (personal_sign) signature of the canonical ownership message, proving control of walletAddress.',
    example: '0xabc...',
  })
  @IsNotEmpty({ message: 'Signature is required' })
  @IsString({ message: 'Signature must be a string' })
  signature: string;
}
