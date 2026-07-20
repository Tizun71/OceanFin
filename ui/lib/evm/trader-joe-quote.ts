import type { Address, PublicClient } from "viem";
import { LB_QUOTER_ABI } from "./abis";

export interface TraderJoeQuote {
  /** Token path (route) — [tokenIn, ...intermediates, tokenOut]. */
  tokenPath: Address[];
  /** Bin steps per hop (LB pair parameter). */
  pairBinSteps: bigint[];
  /** LB versions per hop (uint8 enum values). */
  versions: number[];
  /** Expected output amount (last of amounts[]). */
  amountOut: bigint;
}

/**
 * Fetch a fresh best-path quote from LBQuoter. Always re-quote right before
 * signing — path/amountOut move with liquidity.
 */
export async function quoteTraderJoe(
  publicClient: PublicClient,
  lbQuoter: Address,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
): Promise<TraderJoeQuote> {
  const quote: any = await publicClient.readContract({
    address: lbQuoter,
    abi: LB_QUOTER_ABI,
    functionName: "findBestPathFromAmountIn",
    args: [[tokenIn, tokenOut], amountIn],
  });

  const amounts = quote.amounts as bigint[];
  const amountOut = amounts[amounts.length - 1];
  if (!amountOut || amountOut === 0n) {
    throw new Error("Trader Joe: no route / zero output for this pair");
  }

  return {
    tokenPath: quote.route as Address[],
    pairBinSteps: quote.binSteps as bigint[],
    versions: (quote.versions as number[]).map((v) => Number(v)),
    amountOut,
  };
}
