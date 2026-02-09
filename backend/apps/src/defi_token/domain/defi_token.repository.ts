import { DefiToken } from './defi_token.entity';

export abstract class DefiTokenRepository {
  abstract save(defiToken: DefiToken): Promise<DefiToken>;
}
