import { DefiPair } from './defi_pairs.entity';

export abstract class DefiPairsRepository {
  abstract save(defiPair: DefiPair): Promise<DefiPair>;
}
