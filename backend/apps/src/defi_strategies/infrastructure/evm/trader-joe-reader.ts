import { Address } from 'viem';
import { getEvmPublicClient } from './evm-public-client.factory';
import { LB_QUOTER_ABI } from './trader-joe.abi';

export interface TraderJoeSwapQuote {
  amountOut: bigint;
  /** minOut after slippage (fraction, e.g. 0.005). */
  amountOutMin: bigint;
  /** Price impact percent vs the no-slippage virtual amount. */
  priceImpact: number;
}

/**
 * Server-side swap quote for simulation display. The frontend re-quotes right
 * before signing (source of truth for execution); this is for preview only.
 */
export async function getTraderJoeQuote(
  chainId: number,
  lbQuoter: Address,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  slippage = 0.005,
  // Intermediate hop tokens (e.g. WAVAX) inserted between in/out. Required for
  // pairs without a direct Liquidity Book market — findBestPathFromAmountIn
  // treats `route` as the exact ordered hop sequence, not a candidate set.
  intermediates: Address[] = [],
): Promise<TraderJoeSwapQuote> {
  const client = getEvmPublicClient(chainId);
  // Build the ordered route, dropping any hop that coincides with an endpoint.
  const lower = (a: Address) => a.toLowerCase();
  const hops = intermediates.filter(
    (h) => lower(h) !== lower(tokenIn) && lower(h) !== lower(tokenOut),
  );
  const route: Address[] = [tokenIn, ...hops, tokenOut];

  const quote: any = await client.readContract({
    address: lbQuoter,
    abi: LB_QUOTER_ABI,
    functionName: 'findBestPathFromAmountIn',
    args: [route, amountIn],
  });

  const amounts = quote.amounts as bigint[];
  const virtual = quote.virtualAmountsWithoutSlippage as bigint[];
  const amountOut = amounts[amounts.length - 1];
  if (!amountOut || amountOut === 0n) {
    throw new Error('Trader Joe: no route / zero output for this pair');
  }

  const slippageBps = BigInt(Math.round(slippage * 10_000));
  const amountOutMin = (amountOut * (10_000n - slippageBps)) / 10_000n;

  // Price impact vs the ideal (no-slippage) output.
  const ideal = virtual[virtual.length - 1] ?? amountOut;
  const priceImpact =
    ideal > 0n ? (1 - Number(amountOut) / Number(ideal)) * 100 : 0;

  return { amountOut, amountOutMin, priceImpact };
}
