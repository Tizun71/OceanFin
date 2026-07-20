import type { Address } from "viem";
import { LB_ROUTER_ABI } from "./abis";
import type { EvmStepPlan } from "./aave-v3";
import type { TraderJoeQuote } from "./trader-joe-quote";

/** Default swap deadline window (seconds from now). */
const DEADLINE_WINDOW_SECONDS = 300n;

/**
 * Build a Trader Joe swap plan from a fresh quote.
 * - approve tokenIn → LBRouter (exact amountIn)
 * - swapExactTokensForTokens with slippage-protected minOut + short deadline
 *
 * @param slippage fraction (e.g. 0.005 = 0.5%)
 */
export function buildTraderJoeSwap(params: {
  lbRouter: Address;
  quote: TraderJoeQuote;
  amountIn: bigint;
  slippage: number;
  recipient: Address;
  now?: number;
}): EvmStepPlan {
  const { lbRouter, quote, amountIn, slippage, recipient } = params;

  const nowSec = BigInt(Math.floor((params.now ?? Date.now()) / 1000));
  const deadline = nowSec + DEADLINE_WINDOW_SECONDS;

  // minOut = amountOut * (1 - slippage), integer math in bigint.
  const slippageBps = BigInt(Math.round(slippage * 10_000));
  const amountOutMin = (quote.amountOut * (10_000n - slippageBps)) / 10_000n;

  const tokenIn = quote.tokenPath[0];

  const path = {
    pairBinSteps: quote.pairBinSteps,
    versions: quote.versions,
    tokenPath: quote.tokenPath,
  };

  return {
    approvals: [{ token: tokenIn, spender: lbRouter, amount: amountIn }],
    call: {
      address: lbRouter,
      abi: LB_ROUTER_ABI,
      functionName: "swapExactTokensForTokens",
      args: [amountIn, amountOutMin, path, recipient, deadline],
    },
  };
}
