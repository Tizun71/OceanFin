import type { Address } from "viem";
import { COMPTROLLER_ABI, QI_ERC20_ABI, QI_NATIVE_ABI } from "./benqi-abis";
import type { EvmStepPlan } from "./aave-v3";

/** Enter markets (once) so supplied qiTokens count as collateral. */
export function buildEnterMarkets(comptroller: Address, qiTokens: Address[]): EvmStepPlan {
  return {
    approvals: [],
    call: {
      address: comptroller,
      abi: COMPTROLLER_ABI,
      functionName: "enterMarkets",
      args: [qiTokens],
    },
  };
}

/** SUPPLY an ERC20-underlying market (e.g. qiSAVAX): approve then mint. */
export function buildBenqiMintErc20(params: {
  qiToken: Address;
  underlying: Address;
  amount: bigint;
}): EvmStepPlan {
  const { qiToken, underlying, amount } = params;
  return {
    approvals: [{ token: underlying, spender: qiToken, amount }],
    call: {
      address: qiToken,
      abi: QI_ERC20_ABI,
      functionName: "mint",
      args: [amount],
    },
  };
}

/** BORROW from a market (e.g. qiAVAX). Amount is the underlying to borrow. */
export function buildBenqiBorrow(qiToken: Address, amount: bigint): EvmStepPlan {
  return {
    approvals: [],
    call: {
      address: qiToken,
      abi: QI_ERC20_ABI,
      functionName: "borrow",
      args: [amount],
    },
  };
}

/** Repay a native market (qiAVAX): payable repayBorrow with value = amount. */
export function buildBenqiRepayNative(qiToken: Address, amount: bigint): EvmStepPlan {
  return {
    approvals: [],
    call: {
      address: qiToken,
      abi: QI_NATIVE_ABI,
      functionName: "repayBorrow",
      args: [],
      value: amount,
    },
  };
}

/** Withdraw supplied collateral by underlying amount (redeemUnderlying). */
export function buildBenqiRedeemUnderlying(qiToken: Address, amount: bigint): EvmStepPlan {
  return {
    approvals: [],
    call: {
      address: qiToken,
      abi: QI_ERC20_ABI,
      functionName: "redeemUnderlying",
      args: [amount],
    },
  };
}
