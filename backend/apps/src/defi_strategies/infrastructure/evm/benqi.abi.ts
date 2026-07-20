/** Minimal Benqi (Compound fork) + StakedAvax ABIs for server-side reads. */

export const COMPTROLLER_ABI = [
  {
    type: 'function',
    name: 'markets',
    stateMutability: 'view',
    inputs: [{ name: 'qiToken', type: 'address' }],
    outputs: [
      { name: 'isListed', type: 'bool' },
      { name: 'collateralFactorMantissa', type: 'uint256' },
      { name: 'isQied', type: 'bool' },
    ],
  },
] as const;

export const QI_TOKEN_ABI = [
  {
    type: 'function',
    name: 'supplyRatePerTimestamp',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'borrowRatePerTimestamp',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const STAKED_AVAX_ABI = [
  {
    type: 'function',
    name: 'getPooledAvaxByShares',
    stateMutability: 'view',
    inputs: [{ name: 'shareAmount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getSharesByPooledAvax',
    stateMutability: 'view',
    inputs: [{ name: 'avaxAmount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
