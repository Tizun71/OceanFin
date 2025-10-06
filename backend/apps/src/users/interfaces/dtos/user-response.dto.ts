import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  walletAddress: string;

  @Expose()
  chainId: number;

  @Expose()
  username?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
