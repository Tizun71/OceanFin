import type { BenqiAddresses } from "@/config/chains/chain-registry";
import type { EvmStepPlan } from "./aave-v3";
import {
  buildBenqiBorrow,
  buildBenqiMintErc20,
  buildBenqiRedeemUnderlying,
  buildBenqiRepayNative,
  buildEnterMarkets,
} from "./benqi";
import { buildRequestUnlock, buildStakeAvax } from "./staked-avax";

/** One loop iteration, amounts precomputed by the simulator (exchange rate + collateral factor aware). */
export interface BenqiLoopIteration {
  /** Native AVAX staked this loop (loop 0 = initial capital; later = prior borrow). */
  stakeAvax: bigint;
  /** Expected sAVAX shares from staking `stakeAvax` (from getSharesByPooledAvax). */
  sAvaxShares: bigint;
  /** AVAX borrowed this loop (bounded by collateral-factor headroom). */
  borrowAvax: bigint;
}

/**
 * Expand a leveraged sAVAX loop into an ordered EVM step list (JOIN_STRATEGY analog):
 *   enterMarkets(once) → per loop: stake AVAX→sAVAX → mint qiSAVAX → borrow AVAX
 * Each returned plan runs through execute-evm-step's simulate gate.
 */
export function buildBenqiLoopEntry(
  benqi: BenqiAddresses,
  loops: BenqiLoopIteration[],
): EvmStepPlan[] {
  const plans: EvmStepPlan[] = [
    buildEnterMarkets(benqi.comptroller, [benqi.qiSAvax, benqi.qiAvax]),
  ];

  for (const loop of loops) {
    plans.push(buildStakeAvax(benqi.sAvax, loop.stakeAvax));
    plans.push(
      buildBenqiMintErc20({
        qiToken: benqi.qiSAvax,
        underlying: benqi.sAvax,
        amount: loop.sAvaxShares,
      }),
    );
    if (loop.borrowAvax > 0n) {
      plans.push(buildBenqiBorrow(benqi.qiAvax, loop.borrowAvax));
    }
  }

  return plans;
}

export interface BenqiUnwindStep {
  /** AVAX to repay to qiAVAX this unwind step. */
  repayAvax: bigint;
  /** sAVAX underlying to withdraw from qiSAVAX after repay. */
  redeemSAvax: bigint;
}

/**
 * Cooldown-unstake exit: repay AVAX → redeem sAVAX collateral → requestUnlock
 * (starts the ~15d cooldown). The final `redeem(unlockIndex)` after cooldown is a
 * separate resumable step (see execution-modal cooldown-pending state).
 * Instant exit alternative = swap sAVAX→AVAX on Trader Joe (Phase 3 rail).
 */
export function buildBenqiCooldownExit(
  benqi: BenqiAddresses,
  unwind: BenqiUnwindStep[],
  totalSAvaxToUnlock: bigint,
): EvmStepPlan[] {
  const plans: EvmStepPlan[] = [];

  for (const step of unwind) {
    if (step.repayAvax > 0n) plans.push(buildBenqiRepayNative(benqi.qiAvax, step.repayAvax));
    if (step.redeemSAvax > 0n)
      plans.push(buildBenqiRedeemUnderlying(benqi.qiSAvax, step.redeemSAvax));
  }

  if (totalSAvaxToUnlock > 0n) {
    plans.push(buildRequestUnlock(benqi.sAvax, totalSAvaxToUnlock));
  }

  return plans;
}
