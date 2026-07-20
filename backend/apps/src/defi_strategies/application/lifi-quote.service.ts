import { Injectable } from '@nestjs/common';

const LIFI_BASE_URL = process.env.LIFI_API_URL || 'https://li.quest/v1';
const LIFI_API_KEY = process.env.LIFI_API_KEY;
const LIFI_INTEGRATOR = process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || 'oceanfin';

export interface LifiQuoteSummary {
  tool: string;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  /** Estimated bridge duration (seconds). */
  executionDuration?: number;
  /** Total fee/gas cost in USD, if provided by the route estimate. */
  feeUsd?: number;
}

/**
 * Read-only LI.FI quote for simulation display (fees / time / route). No signing.
 * Production sends the x-lifi-api-key header for higher rate limits; keyless works
 * as a graceful fallback.
 */
@Injectable()
export class LifiQuoteService {
  async getQuote(params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    fromAddress: string;
    slippage?: number;
  }): Promise<LifiQuoteSummary> {
    const query = new URLSearchParams({
      fromChain: String(params.fromChain),
      toChain: String(params.toChain),
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
      slippage: String(params.slippage ?? 0.005),
      integrator: LIFI_INTEGRATOR,
    });

    const headers: Record<string, string> = {};
    if (LIFI_API_KEY) headers['x-lifi-api-key'] = LIFI_API_KEY;

    const res = await fetch(`${LIFI_BASE_URL}/quote?${query.toString()}`, { headers });
    if (!res.ok) {
      throw new Error(`LI.FI quote failed: ${res.status} ${await res.text()}`);
    }

    const data: any = await res.json();
    const estimate = data.estimate ?? {};

    const feeUsd = [...(estimate.feeCosts ?? []), ...(estimate.gasCosts ?? [])].reduce(
      (sum: number, c: any) => sum + (Number(c.amountUSD) || 0),
      0,
    );

    return {
      tool: data.tool,
      fromAmount: estimate.fromAmount,
      toAmount: estimate.toAmount,
      toAmountMin: estimate.toAmountMin,
      executionDuration: estimate.executionDuration,
      feeUsd,
    };
  }
}
