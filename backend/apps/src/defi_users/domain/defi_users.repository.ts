import { DefiUser } from './defi_user.entity';

export abstract class DefiUsersRepository {
  abstract createDefiUser(defiUser: DefiUser): Promise<DefiUser>;
  abstract getDefiUserByWalletAddress(
    wallet_address: string,
  ): Promise<DefiUser>;
  abstract getDefiUserById(id: string): Promise<DefiUser>;
}
