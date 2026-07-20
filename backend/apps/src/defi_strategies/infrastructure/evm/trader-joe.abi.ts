/** Minimal LFJ (Trader Joe) LBQuoter ABI for server-side swap quotes. */
export const LB_QUOTER_ABI = [
  {
    type: 'function',
    name: 'findBestPathFromAmountIn',
    stateMutability: 'view',
    inputs: [
      { name: 'route', type: 'address[]' },
      { name: 'amountIn', type: 'uint128' },
    ],
    outputs: [
      {
        name: 'quote',
        type: 'tuple',
        components: [
          { name: 'route', type: 'address[]' },
          { name: 'pairs', type: 'address[]' },
          { name: 'binSteps', type: 'uint256[]' },
          { name: 'versions', type: 'uint8[]' },
          { name: 'amounts', type: 'uint128[]' },
          { name: 'virtualAmountsWithoutSlippage', type: 'uint128[]' },
          { name: 'fees', type: 'uint128[]' },
        ],
      },
    ],
  },
] as const;
