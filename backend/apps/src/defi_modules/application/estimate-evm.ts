import { Address, formatUnits, parseUnits } from 'viem';
import { AaveV3Avalanche } from '@bgd-labs/aave-address-book';
import { getReserveInfo } from '../../defi_strategies/infrastructure/evm/aave-reader';
import {
  getQiTokenApys,
  getCollateralFactor,
} from '../../defi_strategies/infrastructure/evm/benqi-reader';
import { getTraderJoeQuote } from '../../defi_strategies/infrastructure/evm/trader-joe-reader';
import { getAssetPricesUsd } from '../../defi_strategies/infrastructure/evm/aave-oracle';

/**
 * On-chain estimate for Avalanche EVM tokens — the counterpart to the
 * Hydration-only estimates in defi_pairs.service.ts. Reads live protocol state
 * (Aave v3 reserves, Benqi qiToken markets, Trader Joe quotes) instead of
 * addressing assets by Hydration asset_id. All APYs are returned as PERCENTAGES.
 */

export const AVALANCHE_CHAIN_ID = 43114;

const AAVE_POOL = AaveV3Avalanche.POOL as Address;
const AAVE_ORACLE = AaveV3Avalanche.ORACLE as Address;

// Trader Joe (LFJ) Liquidity Book v2.2 quoter — same address as ui/config/chains.
const LB_QUOTER = '0x9A550a522BBaDFB69019b0432800Ed17855A51C3' as Address;

// WAVAX is the routing hub on Avalanche — most tokens have a WAVAX LB pair but
// few have direct pairs with each other, so swaps route through it.
const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' as Address;

// Benqi ERC-20 markets: lowercased underlying -> qiToken. Mirrors the
// `benqi.markets` map in ui/config/chains/chain-registry.ts (keep in sync).
const BENQI_COMPTROLLER = '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4' as Address;
const BENQI_MARKETS: Record<string, Address> = {
  '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be': '0xF362feA9659cf036792c9cb02f8ff8198E21B4cB', // sAVAX
  '0x152b9d0fdc40c096757f570a51e494bd4b943e50': '0x89a415b3D20098E6A6C8f7a59001C67BD3129821', // BTC.b
  '0x50b7545627a5162f82a992c33b87adc75187b218': '0xe194c4c5aC32a3C9ffDb358d9Bfd523a0B6d1568', // WBTC.e
  '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab': '0x334AD834Cd4481BB02d09615E7c11a00579A7909', // WETH.e
  '0x5947bb275c521040051d82396192181b413227a3': '0x4e9f683A27a6BdAD3FC2764003759277e93696e6', // LINK.e
  '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': '0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF', // USDT
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': '0xB715808a78F6041E46d61Cb123C9B4A27056AE9C', // USDC
  '0xd586e7f844cea2f87f50152665bcbc2c279d8d70': '0x835866d37AFB8CB8F8334dCCdaf66cf01832Ff5D', // DAI.e
};

// Keep a small liquidation buffer so the quoted max-borrow does not sit exactly
// on the LTV limit (which would be immediately liquidatable).
const BORROW_BUFFER = 0.99;

const isBenqi = (protocol?: string) =>
  (protocol ?? '').toUpperCase() === 'BENQI';

function requireBenqiMarket(underlying: Address): Address {
  const qiToken = BENQI_MARKETS[underlying.toLowerCase()];
  if (!qiToken) {
    throw new Error(`Benqi has no market for token ${underlying} on Avalanche`);
  }
  return qiToken;
}

export interface EvmToken {
  address: Address;
  decimals: number;
}

/** SUPPLY: live supply APY for the token's Aave/Benqi market (percent). */
export async function estimateEvmSupply(
  protocol: string | undefined,
  token: EvmToken,
): Promise<{ supply_apy: number }> {
  if (isBenqi(protocol)) {
    const { supplyApy } = await getQiTokenApys(
      AVALANCHE_CHAIN_ID,
      requireBenqiMarket(token.address),
    );
    return { supply_apy: supplyApy * 100 };
  }
  const { supplyApy } = await getReserveInfo(
    AVALANCHE_CHAIN_ID,
    AAVE_POOL,
    token.address,
  );
  return { supply_apy: supplyApy * 100 };
}

/**
 * BORROW: variable borrow APY of the borrow token, the collateral's LTV, and the
 * max borrowable amount (in borrow-token units) for `collateralAmount` supplied.
 */
export async function estimateEvmBorrow(
  protocol: string | undefined,
  collateral: EvmToken,
  borrow: EvmToken,
  collateralAmount: number,
): Promise<{
  borrow_apy: number;
  ltv: number;
  max_borrow_amount: number;
  liquidation_threshold?: number;
}> {
  // Price both legs so a cross-asset borrow (collateral != borrow) is valued
  // correctly; same-asset borrows get a 1:1 ratio.
  const [priceCollateral, priceBorrow] = await priceRatio(
    collateral.address,
    borrow.address,
  );
  const priceScale = priceBorrow === 0 ? 1 : priceCollateral / priceBorrow;

  if (isBenqi(protocol)) {
    const [{ borrowApy }, ltv] = await Promise.all([
      getQiTokenApys(AVALANCHE_CHAIN_ID, requireBenqiMarket(borrow.address)),
      getCollateralFactor(
        AVALANCHE_CHAIN_ID,
        BENQI_COMPTROLLER,
        requireBenqiMarket(collateral.address),
      ),
    ]);
    return {
      borrow_apy: borrowApy * 100,
      ltv: ltv * 100,
      max_borrow_amount:
        collateralAmount * ltv * priceScale * BORROW_BUFFER,
    };
  }

  const [collateralInfo, borrowInfo] = await Promise.all([
    getReserveInfo(AVALANCHE_CHAIN_ID, AAVE_POOL, collateral.address),
    getReserveInfo(AVALANCHE_CHAIN_ID, AAVE_POOL, borrow.address),
  ]);
  return {
    borrow_apy: borrowInfo.variableBorrowApy * 100,
    ltv: collateralInfo.ltv * 100,
    liquidation_threshold: collateralInfo.liquidationThreshold * 100,
    max_borrow_amount:
      collateralAmount * collateralInfo.ltv * priceScale * BORROW_BUFFER,
  };
}

/** SWAP: Trader Joe on-chain quote (amount_out in tokenOut units). */
export async function estimateEvmSwap(
  tokenIn: EvmToken,
  tokenOut: EvmToken,
  amountIn: number,
  slippage = 0.005,
): Promise<{ amount_out: number; slippage: number }> {
  const quote = await getTraderJoeQuote(
    AVALANCHE_CHAIN_ID,
    LB_QUOTER,
    tokenIn.address,
    tokenOut.address,
    parseUnits(String(amountIn), tokenIn.decimals),
    slippage,
    [WAVAX],
  );
  return {
    amount_out: Number(formatUnits(quote.amountOut, tokenOut.decimals)),
    slippage,
  };
}

/** USD prices (Aave oracle) for two underlyings, ordered [a, b]. */
async function priceRatio(a: Address, b: Address): Promise<[number, number]> {
  if (a.toLowerCase() === b.toLowerCase()) return [1, 1];
  const prices = await getAssetPricesUsd(AVALANCHE_CHAIN_ID, AAVE_ORACLE, [a, b]);
  const pa = Number(prices[a.toLowerCase()] ?? 0);
  const pb = Number(prices[b.toLowerCase()] ?? 0);
  return [pa, pb];
}
