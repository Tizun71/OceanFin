import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  walletAddress: string;

  @Expose()
  chainId: number;

  @Expose()
  username?: string;
}
