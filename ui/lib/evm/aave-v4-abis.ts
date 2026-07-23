/**
 * Minimal Aave V4 Spoke ABI — only the functions OceanFin calls or reads.
 * Verified against the deployed Avalanche spoke implementation
 * (0x56f74d6bc5f51da3ba0d3f715a67cd7d15358ad4, proxied by the spokes listed in
 * config/chains/chain-registry.ts).
 *
 * V4 addresses a position by `reserveId` — a per-spoke index, NOT a token
 * address. The id is resolved on-chain in aave-v4.ts (never hardcoded: reserves
 * are added by governance).
 */

export const AAVE_V4_SPOKE_ABI = [
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reserveId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reserveId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reserveId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "repay",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reserveId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "setUsingAsCollateral",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reserveId", type: "uint256" },
      { name: "usingAsCollateral", type: "bool" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getReserveCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getReserve",
    stateMutability: "view",
    inputs: [{ name: "reserveId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "underlying", type: "address" },
          { name: "hub", type: "address" },
          { name: "assetId", type: "uint16" },
          { name: "decimals", type: "uint8" },
          { name: "collateralRisk", type: "uint24" },
          { name: "flags", type: "uint8" },
          { name: "dynamicConfigKey", type: "uint32" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getReserveConfig",
    stateMutability: "view",
    inputs: [{ name: "reserveId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "collateralRisk", type: "uint24" },
          { name: "paused", type: "bool" },
          { name: "frozen", type: "bool" },
          { name: "borrowable", type: "bool" },
          { name: "receiveSharesEnabled", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getDynamicReserveConfig",
    stateMutability: "view",
    inputs: [
      { name: "reserveId", type: "uint256" },
      { name: "dynamicConfigKey", type: "uint32" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "collateralFactor", type: "uint16" },
          { name: "maxLiquidationBonus", type: "uint32" },
          { name: "liquidationFee", type: "uint16" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getUserReserveStatus",
    stateMutability: "view",
    inputs: [
      { name: "reserveId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [
      { name: "usingAsCollateral", type: "bool" },
      { name: "borrowing", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getUserAccountData",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "riskPremium", type: "uint256" },
          { name: "avgCollateralFactor", type: "uint256" },
          { name: "healthFactor", type: "uint256" },
          { name: "totalCollateralValue", type: "uint256" },
          { name: "totalDebtValueRay", type: "uint256" },
          { name: "activeCollateralCount", type: "uint256" },
          { name: "borrowCount", type: "uint256" },
        ],
      },
    ],
  },
] as const;
