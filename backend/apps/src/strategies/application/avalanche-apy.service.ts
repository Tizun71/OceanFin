import { Injectable } from '@nestjs/common';
import { Address } from 'viem';
import { AaveV3Avalanche } from '@bgd-labs/aave-address-book';
import { getReserveApys } from '../../defi_strategies/infrastructure/evm/aave-reader';
import { getSAvaxStakingApr } from '../../defi_strategies/infrastructure/evm/benqi-reader';
import { AVALANCHE_STRATEGY } from './strategy-list';

const CHAIN_ID = 43114;

/** Avalanche reserve addresses — must match backend/apps/seeds/0001-defi-token.sql. */
const TOKEN = {
  WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' as Address,
  sAVAX: '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be' as Address,
  USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e' as Address,
  USDt: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7' as Address,
};

/**
 * Loop exposure factors for `loops` re-supplies at `ltv` utilisation.
 * Supplied capital is 1 + ltv + ltv^2 ... and borrowed is the same series minus
 * the initial unlevered deposit.
 */
function loopExposure(
  ltv: number,
  loops: number,
): { supply: number; borrow: number } {
  let supply = 1;
  let borrow = 0;
  for (let i = 1; i <= loops; i++) {
    const leg = ltv ** i;
    supply += leg;
    borrow += leg;
  }
  return { supply, borrow };
}

/**
 * Live APY for the Avalanche strategies seeded in 0003-strategies.sql, computed
 * from on-chain state only (Aave V3 reserve rates + sAVAX exchange-rate drift).
 * Percentages, matching the `strategies.apy` column.
 *
 * Rates move, so a strategy that is profitable today can invert — callers should
 * surface whatever this returns rather than caching a hardcoded number.
 */
@Injectable()
export class AvalancheApyService {
  supports(strategistName: string): boolean {
    return (Object.values(AVALANCHE_STRATEGY) as string[]).includes(
      strategistName,
    );
  }

  async calculateApy(strategistName: string): Promise<{ apy: number }> {
    switch (strategistName as AVALANCHE_STRATEGY) {
      case AVALANCHE_STRATEGY.SAVAX_LOOP_EMODE:
        // E-mode 2 ("AVAX correlated") allows 93% LTV; 75% leaves liquidation buffer.
        return { apy: await this.savaxLoopApy(0.75, 3) };
      case AVALANCHE_STRATEGY.SAVAX_LOOP_CONSERVATIVE:
        // Outside e-mode sAVAX caps at 50% LTV; 40% keeps the health factor high.
        return { apy: await this.savaxLoopApy(0.4, 2) };
      case AVALANCHE_STRATEGY.USDC_SUPPLY:
        return { apy: await this.supplyApy(TOKEN.USDC) };
      case AVALANCHE_STRATEGY.USDT_SUPPLY:
        return { apy: await this.supplyApy(TOKEN.USDt) };
      case AVALANCHE_STRATEGY.USDC_AVAX_CARRY:
        return { apy: await this.usdcAvaxCarryApy(0.6) };
      default:
        throw new Error(`Not an Avalanche strategy: ${strategistName}`);
    }
  }

  /** Plain Aave supply — the reserve's own liquidity rate. */
  private async supplyApy(asset: Address): Promise<number> {
    const { supplyApy } = await getReserveApys(
      CHAIN_ID,
      AaveV3Avalanche.POOL,
      asset,
    );
    return supplyApy * 100;
  }

  /**
   * Supply sAVAX, borrow WAVAX, swap back to sAVAX, repeat. sAVAX earns no Aave
   * supply yield, so the return is staking APR on the levered position minus the
   * WAVAX borrow cost on the borrowed leg.
   */
  private async savaxLoopApy(ltv: number, loops: number): Promise<number> {
    const [stakingApr, wavax] = await Promise.all([
      getSAvaxStakingApr(CHAIN_ID, TOKEN.sAVAX),
      getReserveApys(CHAIN_ID, AaveV3Avalanche.POOL, TOKEN.WAVAX),
    ]);

    const { supply, borrow } = loopExposure(ltv, loops);
    return (stakingApr * supply - wavax.variableBorrowApy * borrow) * 100;
  }

  /**
   * Hold USDC as collateral, borrow WAVAX against it and stake the proceeds as
   * sAVAX. Earns the USDC supply rate plus the staking-minus-borrow spread on the
   * borrowed leg, with no forced sale of the stablecoin base.
   */
  private async usdcAvaxCarryApy(ltv: number): Promise<number> {
    const [stakingApr, usdc, wavax] = await Promise.all([
      getSAvaxStakingApr(CHAIN_ID, TOKEN.sAVAX),
      getReserveApys(CHAIN_ID, AaveV3Avalanche.POOL, TOKEN.USDC),
      getReserveApys(CHAIN_ID, AaveV3Avalanche.POOL, TOKEN.WAVAX),
    ]);

    const spread = stakingApr - wavax.variableBorrowApy;
    return (usdc.supplyApy + ltv * spread) * 100;
  }
}
