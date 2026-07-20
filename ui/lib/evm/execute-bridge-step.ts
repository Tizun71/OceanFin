import type { Address, PublicClient, WalletClient } from "viem";
import { getAllowance, buildApproveCall } from "./erc20";
import {
  getLifiQuote,
  getLifiStatus,
  type LifiQuote,
  type LifiStatusResult,
} from "./lifi";
import { EVM_CHAIN_IDS } from "@/config/chains/chain-registry";

const NATIVE_SENTINEL = "0x0000000000000000000000000000000000000000";

export interface BridgePersist {
  txHash: `0x${string}`;
  tool: string;
  fromChain: number;
  toChain: number;
}

export interface ExecuteBridgeDeps {
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Address;
  expectedChainId: number;
  /** Persist source tx + route so a pending bridge resumes across sessions. */
  onSent?: (info: BridgePersist) => void | Promise<void>;
  /** Poll cap (ms) before returning PENDING (funds safe, resumable). */
  pollTimeoutMs?: number;
}

export interface ExecuteBridgeResult {
  txHash: `0x${string}`;
  tool: string;
  status: LifiStatusResult;
}

/**
 * Execute a cross-chain bridge via LI.FI: approve (ERC20) → send the
 * LI.FI transactionRequest → poll /status until DONE/FAILED (or timeout →
 * PENDING, resumable). EVM↔EVM only.
 */
export async function executeBridgeStep(
  params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    fromAmount: bigint;
  },
  deps: ExecuteBridgeDeps,
): Promise<ExecuteBridgeResult> {
  const { publicClient, walletClient, account, expectedChainId } = deps;

  // EVM↔EVM guard — never bridge to/from a non-EVM chain.
  if (!EVM_CHAIN_IDS.includes(params.fromChain) || !EVM_CHAIN_IDS.includes(params.toChain)) {
    throw new Error("Bridge supports EVM chains only");
  }

  // Chain assertion before any signing.
  const walletChainId = await walletClient.getChainId();
  if (walletChainId !== expectedChainId) {
    throw new Error(`Wallet on chain ${walletChainId}, expected ${expectedChainId}.`);
  }

  const quote: LifiQuote = await getLifiQuote({
    fromChain: params.fromChain,
    toChain: params.toChain,
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.fromAmount.toString(),
    fromAddress: account,
  });

  // Approve fromToken → LI.FI diamond when the source token is an ERC20.
  const isNative = params.fromToken.toLowerCase() === NATIVE_SENTINEL;
  if (!isNative && quote.approvalAddress) {
    const spender = quote.approvalAddress;
    const current = await getAllowance(
      publicClient,
      params.fromToken as Address,
      account,
      spender,
    );
    if (current < params.fromAmount) {
      const approveCall = buildApproveCall(params.fromToken as Address, spender, params.fromAmount);
      const approveHash = await walletClient.writeContract({
        account,
        address: approveCall.address,
        abi: approveCall.abi as any,
        functionName: approveCall.functionName,
        args: approveCall.args as any,
        chain: walletClient.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
    }
  }

  // Send the LI.FI source transaction (raw calldata, not a typed contract call).
  const tx = quote.transactionRequest;
  const txHash = await walletClient.sendTransaction({
    account,
    to: tx.to,
    data: tx.data,
    value: tx.value ? BigInt(tx.value) : undefined,
    chain: walletClient.chain,
  });

  // Persist immediately so a close/refresh can resume polling (funds are en route).
  await deps.onSent?.({
    txHash,
    tool: quote.tool,
    fromChain: params.fromChain,
    toChain: params.toChain,
  });

  const status = await pollBridgeStatus(
    { txHash, tool: quote.tool, fromChain: params.fromChain, toChain: params.toChain },
    deps.pollTimeoutMs ?? 5 * 60_000,
  );

  return { txHash, tool: quote.tool, status };
}

/**
 * Poll LI.FI /status with exponential backoff until DONE/FAILED or timeout.
 * On timeout returns the last PENDING status — funds are safe and resumable.
 */
export async function pollBridgeStatus(
  info: BridgePersist,
  timeoutMs: number,
): Promise<LifiStatusResult> {
  const start = Date.now();
  let delay = 4_000;
  let last: LifiStatusResult = { status: "PENDING" };

  while (Date.now() - start < timeoutMs) {
    last = await getLifiStatus({
      txHash: info.txHash,
      fromChain: info.fromChain,
      toChain: info.toChain,
      tool: info.tool,
    });
    if (last.status === "DONE" || last.status === "FAILED") return last;

    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.5, 30_000);
  }

  return last; // PENDING — resumable
}
