import { DefiPair } from './defi_pairs.entity';

export abstract class DefiPairsRepository {
  abstract save(defiPair: DefiPair): Promise<DefiPair>;
  abstract findAll(): Promise<DefiPair[]>;
  abstract findByActionId(actionId: string): Promise<DefiPair[]>;
  abstract findByTokenInId(tokenInId: string): Promise<DefiPair[]>;
  abstract findByTokenOutId(tokenOutId: string): Promise<DefiPair[]>;
  abstract findByTokenPair(tokenInId: string, tokenOutId: string): Promise<DefiPair[]>;
}
