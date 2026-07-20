import axios from "axios";

const LIFI_BASE_URL =
  process.env.NEXT_PUBLIC_LIFI_API_URL || "https://li.quest/v1";
const LIFI_INTEGRATOR = process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || "oceanfin";

export interface LifiTransactionRequest {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
  chainId: number;
  gasLimit?: string;
  gasPrice?: string;
}

export interface LifiQuote {
  /** Contract to approve fromToken to (the LI.FI diamond). Absent for native. */
  approvalAddress?: `0x${string}`;
  /** Bridge/tool key needed for /status polling. */
  tool: string;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  /** Estimated execution duration in seconds. */
  executionDuration?: number;
  /** Ready-to-sign source transaction. */
  transactionRequest: LifiTransactionRequest;
}

export type LifiStatus = "NOT_FOUND" | "PENDING" | "DONE" | "FAILED";

export interface LifiStatusResult {
  status: LifiStatus;
  substatus?: string;
  substatusMessage?: string;
  /** Destination tx hash when DONE. */
  receivingTxHash?: string;
}

/**
 * Fetch a fresh cross-chain quote. EVM↔EVM only — callers must reject any route
 * touching a non-EVM chain. Non-custodial: the returned transactionRequest is
 * signed client-side by the user.
 */
export async function getLifiQuote(params: {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  slippage?: number;
}): Promise<LifiQuote> {
  const { data } = await axios.get(`${LIFI_BASE_URL}/quote`, {
    params: {
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
      slippage: params.slippage ?? 0.005,
      integrator: LIFI_INTEGRATOR,
    },
  });

  return {
    approvalAddress: data.estimate?.approvalAddress,
    tool: data.tool,
    fromAmount: data.estimate?.fromAmount,
    toAmount: data.estimate?.toAmount,
    toAmountMin: data.estimate?.toAmountMin,
    executionDuration: data.estimate?.executionDuration,
    transactionRequest: data.transactionRequest,
  };
}

/** Poll transfer status. Bridges are not atomic — call until DONE/FAILED. */
export async function getLifiStatus(params: {
  txHash: string;
  fromChain: number;
  toChain: number;
  tool: string;
}): Promise<LifiStatusResult> {
  const { data } = await axios.get(`${LIFI_BASE_URL}/status`, {
    params: {
      txHash: params.txHash,
      fromChain: params.fromChain,
      toChain: params.toChain,
      bridge: params.tool,
    },
  });

  return {
    status: data.status,
    substatus: data.substatus,
    substatusMessage: data.substatusMessage,
    receivingTxHash: data.receiving?.txHash,
  };
}
