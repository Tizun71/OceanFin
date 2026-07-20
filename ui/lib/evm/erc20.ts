import type { Address, PublicClient } from "viem";
import { ERC20_ABI } from "./abis";

/** A single contract write, described declaratively so it can be simulated then sent. */
export interface EvmCall {
  address: Address;
  abi: readonly unknown[];
  functionName: string;
  args: readonly unknown[];
  value?: bigint;
}

/** An approval requirement the executor resolves before the spend call. */
export interface ApprovalRequirement {
  token: Address;
  spender: Address;
  amount: bigint;
}

export async function getAllowance(
  publicClient: PublicClient,
  token: Address,
  owner: Address,
  spender: Address,
): Promise<bigint> {
  return publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [owner, spender],
  }) as Promise<bigint>;
}

/**
 * Build an exact-amount approve call. MVP deliberately approves the exact spend
 * (not MaxUint256) to cap risk from a compromised spender.
 */
export function buildApproveCall(token: Address, spender: Address, amount: bigint): EvmCall {
  return {
    address: token,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spender, amount],
  };
}
