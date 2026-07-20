import type { Address } from "viem";
import { AAVE_V3_POOL_ABI } from "./abis";
import type { ApprovalRequirement, EvmCall } from "./erc20";

/** Aave interest rate mode: 2 = variable (stable rate is deprecated on v3). */
const VARIABLE_RATE_MODE = 2n;
const NO_REFERRAL = 0;

export interface EvmStepPlan {
  /** Approvals to satisfy before `call` (checked against live allowance). */
  approvals: ApprovalRequirement[];
  /** The primary contract write for this step. */
  call: EvmCall;
}

/** SUPPLY: requires ERC20 approve(asset → Pool) then Pool.supply. */
export function buildAaveSupply(params: {
  pool: Address;
  asset: Address;
  amount: bigint;
  user: Address;
}): EvmStepPlan {
  const { pool, asset, amount, user } = params;
  return {
    approvals: [{ token: asset, spender: pool, amount }],
    call: {
      address: pool,
      abi: AAVE_V3_POOL_ABI,
      functionName: "supply",
      args: [asset, amount, user, NO_REFERRAL],
    },
  };
}

/**
 * BORROW: no approval (same-user borrow against existing collateral).
 * Credit delegation (approveDelegation) is out of scope for MVP.
 */
export function buildAaveBorrow(params: {
  pool: Address;
  asset: Address;
  amount: bigint;
  user: Address;
}): EvmStepPlan {
  const { pool, asset, amount, user } = params;
  return {
    approvals: [],
    call: {
      address: pool,
      abi: AAVE_V3_POOL_ABI,
      functionName: "borrow",
      args: [asset, amount, VARIABLE_RATE_MODE, NO_REFERRAL, user],
    },
  };
}

/**
 * ENABLE_E_MODE: categoryId MUST be read live from the market (not hardcoded).
 * Caller resolves + validates the category before building this plan.
 */
export function buildAaveSetEMode(params: { pool: Address; categoryId: number }): EvmStepPlan {
  const { pool, categoryId } = params;
  return {
    approvals: [],
    call: {
      address: pool,
      abi: AAVE_V3_POOL_ABI,
      functionName: "setUserEMode",
      args: [categoryId],
    },
  };
}
