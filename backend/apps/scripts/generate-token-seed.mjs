/**
 * Generates seeds/0001-defi-token.sql from @bgd-labs/aave-address-book.
 *
 * Token addresses are never hand-typed: a wrong ERC-20 address silently routes
 * user funds to the wrong contract. The address book is the same audited source
 * the frontend already uses for Aave pool addresses (ui/config/chains/chain-registry.ts),
 * so regenerating is always reproducible.
 *
 * Usage: node scripts/generate-token-seed.mjs
 * Then apply: psql ... -f seeds/0001-defi-token.sql
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3Arbitrum,
} from '@bgd-labs/aave-address-book';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'seeds', '0001-defi-token.sql');

// Chain slug -> numeric id must match ui/config/chains/chain-registry.ts.
const CHAINS = [
  { slug: 'avalanche', chainId: 43114, market: AaveV3Avalanche },
  { slug: 'base', chainId: 8453, market: AaveV3Base },
  { slug: 'arbitrum', chainId: 42161, market: AaveV3Arbitrum },
];

const sqlString = (v) => `'${String(v).replace(/'/g, "''")}'`;

/**
 * Address-book keys are internal identifiers, not on-chain symbols. Strategies
 * name their input token by the symbol a user would write ("USDC", "WETH.e"),
 * and ui/lib/strategy-input-token.ts matches on that, so store the real symbol.
 *
 * Chain-scoped because the same key means different tokens per market: on
 * Arbitrum the `USDC` key is BRIDGED USDC.e (0xff97…) while `USDCn` is native
 * USDC (0xaf88…). Getting this backwards routes a swap to the wrong token.
 */
const SYMBOL_OVERRIDES = {
  arbitrum: {
    USDC: 'USDC.e',
    USDCn: 'USDC',
  },
  avalanche: {
    USDt: 'USDT',
    WETHe: 'WETH.e',
    WBTCe: 'WBTC.e',
    DAIe: 'DAI.e',
    LINKe: 'LINK.e',
    AAVEe: 'AAVE.e',
    BTCb: 'BTC.b',
  },
  // Base needs none: its USDC key is native USDC and USDbC is the real symbol.
};

const rows = [];
for (const { slug, chainId, market } of CHAINS) {
  for (const [key, asset] of Object.entries(market.ASSETS ?? {})) {
    if (!asset?.UNDERLYING || asset.decimals === undefined) {
      console.warn(`skip ${slug}/${key}: missing UNDERLYING or decimals`);
      continue;
    }
    const symbol = SYMBOL_OVERRIDES[slug]?.[key] ?? key;
    rows.push({
      symbol,
      slug,
      chainId,
      // Migration 0003 rejects mixed-case addresses; the address book returns
      // checksummed values, so lowercase here.
      address: asset.UNDERLYING.toLowerCase(),
      decimals: asset.decimals,
    });
  }
}

const values = rows
  .map(
    (r) =>
      `  (${sqlString(r.symbol)}, ${sqlString(r.slug)}, ${r.chainId}, ${sqlString(r.address)}, ${r.decimals})`,
  )
  .join(',\n');

const sql = `-- GENERATED FILE — do not edit by hand.
-- Source: @bgd-labs/aave-address-book via scripts/generate-token-seed.mjs
-- Regenerate: node scripts/generate-token-seed.mjs
--
-- Aave v3 reserve tokens for every supported EVM chain. Substrate (Hydration)
-- tokens are seeded separately: they key off asset_id, not an ERC-20 address.
-- Idempotent via the (chain, address) unique index from migration 0003.

INSERT INTO defi_token (name, chain, chain_id, address, decimals) VALUES
${values}
-- The 0003 unique index is partial, so the predicate must be repeated here for
-- Postgres to infer it.
ON CONFLICT (chain, address) WHERE address IS NOT NULL DO UPDATE SET
  name = EXCLUDED.name,
  chain_id = EXCLUDED.chain_id,
  decimals = EXCLUDED.decimals;
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, sql);

const perChain = CHAINS.map(
  (c) => `${c.slug}=${rows.filter((r) => r.slug === c.slug).length}`,
).join(' ');
console.log(`wrote ${OUT}`);
console.log(`${rows.length} tokens (${perChain})`);
