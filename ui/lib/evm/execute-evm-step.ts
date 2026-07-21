import type { Address, PublicClient, WalletClient } from "viem";
import { getAllowance, buildApproveCall, type EvmCall } from "./erc20";
import type { EvmStepPlan } from "./aave-v3";

export interface ExecuteEvmStepResult {
  txHash: `0x${string}`;
  approvalTxHashes: `0x${string}`[];
}

export interface ExecuteEvmStepDeps {
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Address;
  /** The chainId the plan targets; asserted against the wallet before any write. */
  expectedChainId: number;
}

/**
 * Execute one EVM step with mainnet-grade safety:
 *   1. assert wallet is on the expected chain (never sign on the wrong network)
 *   2. resolve approvals (exact-amount, only when allowance insufficient)
 *   3. MANDATORY simulateContract dry-run — a revert blocks signing
 *   4. writeContract + wait for receipt
 *
 * Pure w.r.t. React — takes viem clients so it is unit-testable.
 */
export async function executeEvmStep(
  plan: EvmStepPlan,
  deps: ExecuteEvmStepDeps,
): Promise<ExecuteEvmStepResult> {
  const { publicClient, walletClient, account, expectedChainId } = deps;

  // 1. Chain assertion — hard gate.
  const walletChainId = await walletClient.getChainId();
  if (walletChainId !== expectedChainId) {
    throw new Error(
      `Wallet is on chain ${walletChainId}, expected ${expectedChainId}. Switch network and retry.`,
    );
  }

  const approvalTxHashes: `0x${string}`[] = [];

  // 2. Approvals — only when live allowance is insufficient; approve exact amount.
  for (const req of plan.approvals) {
    const current = await getAllowance(publicClient, req.token, account, req.spender);
    if (current >= req.amount) continue;

    const approveCall = buildApproveCall(req.token, req.spender, req.amount);
    const approveHash = await simulateAndWrite(approveCall, deps);
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    approvalTxHashes.push(approveHash);

    // Re-check allowance after the approve receipt before proceeding to spend.
    const after = await getAllowance(publicClient, req.token, account, req.spender);
    if (after < req.amount) {
      throw new Error(`Approval did not take effect for ${req.token}.`);
    }
  }

  // 2b. Idempotent setup calls (e.g. Benqi enterMarkets) — simulate + write in
  // order so collateral is enabled before the primary call needs it.
  for (const pre of plan.preCalls ?? []) {
    const preHash = await simulateAndWrite(pre, deps);
    await publicClient.waitForTransactionReceipt({ hash: preHash });
  }

  // 3 + 4. Simulate (mandatory) then write the primary call.
  const txHash = await simulateAndWrite(plan.call, deps);
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return { txHash, approvalTxHashes };
}

async function simulateAndWrite(
  call: EvmCall,
  deps: ExecuteEvmStepDeps,
): Promise<`0x${string}`> {
  const { publicClient, walletClient, account } = deps;

  // MANDATORY dry-run: reverts here throw and block the write.
  const { request } = await publicClient.simulateContract({
    account,
    address: call.address,
    abi: call.abi as any,
    functionName: call.functionName,
    args: call.args as any,
    value: call.value,
  });

  return walletClient.writeContract(request as any);
}
