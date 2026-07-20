import type { Address, PublicClient } from "viem";
import { STAKED_AVAX_ABI } from "./benqi-abis";
import type { EvmStepPlan } from "./aave-v3";

/** Stake native AVAX → sAVAX via StakedAvax.submit() (value = amount). */
export function buildStakeAvax(sAvax: Address, amount: bigint): EvmStepPlan {
  return {
    approvals: [],
    call: {
      address: sAvax,
      abi: STAKED_AVAX_ABI,
      functionName: "submit",
      args: [],
      value: amount,
    },
  };
}

/** Start the unstake cooldown (~15d) for a sAVAX share amount. */
export function buildRequestUnlock(sAvax: Address, shareAmount: bigint): EvmStepPlan {
  return {
    approvals: [],
    call: {
      address: sAvax,
      abi: STAKED_AVAX_ABI,
      functionName: "requestUnlock",
      args: [shareAmount],
    },
  };
}

/** Redeem AVAX after cooldown for a specific unlock request index. */
export function buildRedeemUnlock(sAvax: Address, unlockIndex: bigint): EvmStepPlan {
  return {
    approvals: [],
    call: {
      address: sAvax,
      abi: STAKED_AVAX_ABI,
      functionName: "redeem",
      args: [unlockIndex],
    },
  };
}

export async function getCooldownPeriod(
  publicClient: PublicClient,
  sAvax: Address,
): Promise<bigint> {
  return publicClient.readContract({
    address: sAvax,
    abi: STAKED_AVAX_ABI,
    functionName: "cooldownPeriod",
  }) as Promise<bigint>;
}

export async function getSharesByAvax(
  publicClient: PublicClient,
  sAvax: Address,
  avaxAmount: bigint,
): Promise<bigint> {
  return publicClient.readContract({
    address: sAvax,
    abi: STAKED_AVAX_ABI,
    functionName: "getSharesByPooledAvax",
    args: [avaxAmount],
  }) as Promise<bigint>;
}
