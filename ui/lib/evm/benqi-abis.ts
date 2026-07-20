/**
 * Minimal ABIs for Benqi (Compound v2 fork) + StakedAvax (sAVAX liquid staking).
 * Only the functions the loop entry/exit flows call/read.
 */

export const COMPTROLLER_ABI = [
  {
    type: "function",
    name: "enterMarkets",
    stateMutability: "nonpayable",
    inputs: [{ name: "qiTokens", type: "address[]" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getAccountLiquidity",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "error", type: "uint256" },
      { name: "liquidity", type: "uint256" },
      { name: "shortfall", type: "uint256" },
    ],
  },
] as const;

/** ERC20-underlying qiToken (e.g. qiSAVAX): mint takes an amount. */
export const QI_ERC20_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "mintAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "redeemUnderlying",
    stateMutability: "nonpayable",
    inputs: [{ name: "redeemAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [{ name: "borrowAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** Native qiToken (qiAVAX): mint/repay are payable with msg.value. */
export const QI_NATIVE_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "repayBorrow",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [{ name: "borrowAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const STAKED_AVAX_ABI = [
  // Stake native AVAX → sAVAX (exchange-rate based, no slippage).
  {
    type: "function",
    name: "submit",
    stateMutability: "payable",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Start unstake cooldown (~15 days) for a share amount.
  {
    type: "function",
    name: "requestUnlock",
    stateMutability: "nonpayable",
    inputs: [{ name: "shareAmount", type: "uint256" }],
    outputs: [],
  },
  // Redeem AVAX after cooldown for a given unlock request index.
  {
    type: "function",
    name: "redeem",
    stateMutability: "nonpayable",
    inputs: [{ name: "unlockIndex", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getPooledAvaxByShares",
    stateMutability: "view",
    inputs: [{ name: "shareAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getSharesByPooledAvax",
    stateMutability: "view",
    inputs: [{ name: "avaxAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "cooldownPeriod",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getUnlockRequestCount",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
