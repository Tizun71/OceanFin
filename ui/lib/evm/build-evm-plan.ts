import { parseUnits, type Address, type PublicClient } from "viem";
import type { Step } from "@/types/strategy.type";
import { STEP_TYPE } from "@/utils/constant";
import type { ChainMeta } from "@/config/chains/chain-registry";
import {
  buildAaveBorrow,
  buildAaveSetEMode,
  buildAaveSupply,
  type EvmStepPlan,
} from "./aave-v3";
import { quoteTraderJoe } from "./trader-joe-quote";
import { buildTraderJoeSwap } from "./trader-joe";
import { resolveEModeCategoryId } from "./aave-emode";

const DEFAULT_SLIPPAGE = 0.005; // 0.5%

function requireAave(chain: ChainMeta): Address {
  const pool = chain.protocols.aaveV3?.pool;
  if (!pool) throw new Error(`Aave v3 not configured for chain ${chain.slug}`);
  return pool;
}

function requireEvmToken(token: { address?: Address; decimals?: number; amount?: number }) {
  if (!token.address || token.decimals === undefined) {
    throw new Error("EVM step is missing token address/decimals");
  }
  if (token.amount === undefined) throw new Error("EVM step is missing amount");
  return {
    address: token.address,
    amount: parseUnits(String(token.amount), token.decimals),
  };
}

/**
 * Map a strategy Step to an EVM execution plan (approvals + primary call) using
 * the active chain's protocol addresses. Consumed by execute-evm-step.
 *
 * ENABLE_E_MODE requires a category id resolved live from the market; pass it in
 * `eModeCategoryId` (never hardcode).
 */
export function buildEvmStepPlan(
  step: Step,
  chain: ChainMeta,
  user: Address,
  opts?: { eModeCategoryId?: number },
): EvmStepPlan | null {
  const pool = requireAave(chain);

  switch (step.type) {
    case STEP_TYPE.SUPPLY: {
      const { address, amount } = requireEvmToken(step.tokenIn!);
      return buildAaveSupply({ pool, asset: address, amount, user });
    }
    case STEP_TYPE.BORROW: {
      const { address, amount } = requireEvmToken(step.tokenOut!);
      return buildAaveBorrow({ pool, asset: address, amount, user });
    }
    case STEP_TYPE.ENABLE_E_MODE: {
      if (opts?.eModeCategoryId === undefined) {
        throw new Error("ENABLE_E_MODE requires an on-chain-resolved category id");
      }
      return buildAaveSetEMode({ pool, categoryId: opts.eModeCategoryId });
    }
    case STEP_TYPE.ENABLE_BORROWING:
      // No-op on Aave v3 (borrowing enabled per-reserve, not per-user).
      return null;
    default:
      throw new Error(`Unsupported EVM step type: ${step.type}`);
  }
}

/**
 * Async resolver — handles SWAP (needs a fresh on-chain quote) and delegates
 * the sync Aave steps to buildEvmStepPlan. Always re-quotes SWAP right before
 * signing so the executed path/minOut reflect current liquidity.
 */
export async function resolveEvmStepPlan(
  step: Step,
  chain: ChainMeta,
  user: Address,
  publicClient: PublicClient,
  opts?: { eModeCategoryId?: number; slippage?: number },
): Promise<EvmStepPlan | null> {
  // ENABLE_E_MODE stores a category label; resolve the current id on-chain so a
  // governance change can never point the position at the wrong category.
  if (step.type === STEP_TYPE.ENABLE_E_MODE && opts?.eModeCategoryId === undefined) {
    const pool = requireAave(chain);
    const categoryId = await resolveEModeCategoryId(
      publicClient,
      pool,
      step.eModeCategoryLabel ?? "",
    );
    return buildEvmStepPlan(step, chain, user, { ...opts, eModeCategoryId: categoryId });
  }

  if (step.type === STEP_TYPE.SWAP) {
    const tj = chain.protocols.traderJoe;
    if (!tj) throw new Error(`Trader Joe not configured for chain ${chain.slug}`);

    const tokenIn = requireEvmToken(step.tokenIn!);
    const tokenOutAddr = step.tokenOut?.address;
    if (!tokenOutAddr) throw new Error("SWAP step is missing tokenOut address");

    const quote = await quoteTraderJoe(
      publicClient,
      tj.lbQuoter,
      tokenIn.address,
      tokenOutAddr,
      tokenIn.amount,
    );

    return buildTraderJoeSwap({
      lbRouter: tj.lbRouter,
      quote,
      amountIn: tokenIn.amount,
      slippage: opts?.slippage ?? DEFAULT_SLIPPAGE,
      recipient: user,
    });
  }

  return buildEvmStepPlan(step, chain, user, opts);
}
