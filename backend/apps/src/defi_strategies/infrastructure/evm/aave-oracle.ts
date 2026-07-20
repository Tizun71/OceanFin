import { Address } from 'viem';
import { getEvmPublicClient } from './evm-public-client.factory';

/** Aave V3 price oracle — prices in the market base currency (USD, 8 decimals). */
const AAVE_ORACLE_ABI = [
  {
    type: 'function',
    name: 'getAssetsPrices',
    stateMutability: 'view',
    inputs: [{ name: 'assets', type: 'address[]' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'BASE_CURRENCY_UNIT',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * Asset prices keyed by lowercase address, expressed in the market's base
 * currency (USD). Borrow sizing needs a common unit: "borrow 75% of the
 * collateral's value" only makes sense once both legs are priced.
 */
export async function getAssetPricesUsd(
  chainId: number,
  oracle: Address,
  assets: Address[],
): Promise<Record<string, number>> {
  if (assets.length === 0) return {};

  const client = getEvmPublicClient(chainId);
  const [prices, baseUnit] = await Promise.all([
    client.readContract({
      address: oracle,
      abi: AAVE_ORACLE_ABI,
      functionName: 'getAssetsPrices',
      args: [assets],
    }) as Promise<readonly bigint[]>,
    client.readContract({
      address: oracle,
      abi: AAVE_ORACLE_ABI,
      functionName: 'BASE_CURRENCY_UNIT',
    }) as Promise<bigint>,
  ]);

  const unit = Number(baseUnit);
  const out: Record<string, number> = {};
  assets.forEach((asset, i) => {
    out[asset.toLowerCase()] = Number(prices[i]) / unit;
  });
  return out;
}
