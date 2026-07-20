/**
 * Generates seeds/0002-defi-modules.sql — the builder palette: which protocol
 * modules exist per chain, what actions they expose, and which tokens each
 * action accepts.
 *
 * Action names matter: the frontend derives the step type from action.name
 * (ConfigPanel normalizeOperationType -> "SUPPLY" | "BORROW" | "SWAP" | ...).
 * An unrecognised name silently falls back to "SWAP", so keep these exact.
 *
 * Usage: node scripts/generate-module-seed.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3Arbitrum,
} from '@bgd-labs/aave-address-book';
import { deterministicUuid } from './lib/deterministic-uuid.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'seeds', '0002-defi-modules.sql');

const CHAINS = {
  avalanche: { chainId: 43114, market: AaveV3Avalanche },
  base: { chainId: 8453, market: AaveV3Base },
  arbitrum: { chainId: 42161, market: AaveV3Arbitrum },
};

// Trader Joe (LFJ) is deployed on Avalanche + Arbitrum only — matches
// CHAIN_SUPPORTED_NODES in ui/config/chains/chain-registry.ts, where Base has no SWAP.
const SWAP_CHAINS = ['avalanche', 'arbitrum'];

// Swap routing hubs. Pairing every token with every other token would seed
// hundreds of combinations that have no real liquidity; DEXes route through
// these hubs anyway. First match per chain wins, missing symbols are skipped.
const SWAP_HUBS = {
  avalanche: ['WAVAX', 'WETHe', 'USDC'],
  arbitrum: ['WETH', 'USDC', 'WBTC'],
};

const MODULES = [
  {
    key: 'aave-v3',
    name: 'Aave V3',
    protocol: 'AAVE',
    category: 'LENDING',
    description: 'Supply collateral and borrow against it on Aave v3.',
    website: 'https://aave.com',
    icon: '/icons/aave.png',
    chains: Object.keys(CHAINS),
    actions: [
      { name: 'Supply', risk: 'LOW', description: 'Deposit a token as collateral.' },
      { name: 'Borrow', risk: 'MEDIUM', description: 'Borrow a token against supplied collateral.' },
    ],
  },
  {
    key: 'trader-joe',
    name: 'Trader Joe',
    protocol: 'TRADER_JOE',
    category: 'DEX',
    description: 'Swap tokens through Trader Joe (LFJ) Liquidity Book v2.2.',
    website: 'https://lfj.gg',
    icon: '/icons/trader-joe.png',
    chains: SWAP_CHAINS,
    actions: [{ name: 'Swap', risk: 'LOW', description: 'Swap one token for another.' }],
  },
];

const q = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

/** Reserve symbols/addresses for a chain, lowercased to match migration 0003. */
const tokensOf = (slug) =>
  Object.entries(CHAINS[slug].market.ASSETS ?? {})
    .filter(([, a]) => a?.UNDERLYING && a.decimals !== undefined)
    .map(([symbol, a]) => ({ symbol, address: a.UNDERLYING.toLowerCase() }));

/** Subselect so pairs bind to whatever uuid the token seed produced. */
const tokenRef = (slug, address) =>
  `(SELECT id FROM defi_token WHERE chain = ${q(slug)} AND address = ${q(address)})`;

const moduleRows = [];
const actionRows = [];
const pairRows = [];
// Two hub tokens produce the same directed pair twice (once from each hub's
// loop). Postgres rejects duplicate ids inside a single ON CONFLICT insert, so
// dedupe before emitting.
const seenPairIds = new Set();

const pushPair = (id, actionId, tokenInSql, tokenOutSql) => {
  if (seenPairIds.has(id)) return;
  seenPairIds.add(id);
  pairRows.push(`  (${q(id)}, ${q(actionId)}, ${tokenInSql}, ${tokenOutSql})`);
};

for (const mod of MODULES) {
  for (const slug of mod.chains) {
    const { chainId } = CHAINS[slug];
    const moduleId = deterministicUuid(`module:${mod.key}:${slug}`);

    moduleRows.push(
      `  (${[
        q(moduleId), q(`${mod.name} (${slug})`), q(mod.protocol), q(mod.category),
        q(mod.icon), q(mod.description), q(mod.website), 'true', q(slug), chainId,
      ].join(', ')})`,
    );

    const tokens = tokensOf(slug);

    for (const action of mod.actions) {
      const actionId = deterministicUuid(`action:${mod.key}:${slug}:${action.name}`);
      const isSwap = action.name === 'Swap';

      const paramSchema = JSON.stringify({
        amount: { type: 'number', required: true },
        tokenIn: { type: 'address', required: true },
        ...(isSwap ? { tokenOut: { type: 'address', required: true } } : {}),
      });

      actionRows.push(
        `  (${[
          q(actionId), q(moduleId), q(action.name),
          // pallet/call are substrate concepts; EVM calls are encoded client-side
          // from the ABIs in ui/lib/evm, so they stay null here.
          'NULL', 'NULL',
          q(action.description), `${q(paramSchema)}::jsonb`, q(action.risk), 'true',
        ].join(', ')})`,
      );

      if (!isSwap) {
        // Lending actions take a single token; token_out stays null.
        for (const t of tokens) {
          pushPair(
            deterministicUuid(`pair:${actionId}:${t.address}`),
            actionId,
            tokenRef(slug, t.address),
            'NULL',
          );
        }
        continue;
      }

      const hubs = (SWAP_HUBS[slug] ?? []).filter((h) => tokens.some((t) => t.symbol === h));
      for (const hub of hubs) {
        const hubToken = tokens.find((t) => t.symbol === hub);
        for (const t of tokens) {
          if (t.address === hubToken.address) continue;
          // Both directions: swap direction is meaningful.
          for (const [a, b] of [[t, hubToken], [hubToken, t]]) {
            pushPair(
              deterministicUuid(`pair:${actionId}:${a.address}:${b.address}`),
              actionId,
              tokenRef(slug, a.address),
              tokenRef(slug, b.address),
            );
          }
        }
      }
    }
  }
}

const sql = `-- GENERATED FILE — do not edit by hand.
-- Source: scripts/generate-module-seed.mjs (token addresses from @bgd-labs/aave-address-book)
-- Regenerate: node scripts/generate-module-seed.mjs
-- Requires 0001-defi-token.sql to have been applied: pairs resolve token ids by
-- (chain, address) subselect.
--
-- Ids are deterministic (uuid v5), so re-running updates rows in place.

INSERT INTO defi_modules (id, name, protocol, category, icon_url, description, website_url, is_active, chain, chain_id) VALUES
${moduleRows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, protocol = EXCLUDED.protocol, category = EXCLUDED.category,
  icon_url = EXCLUDED.icon_url, description = EXCLUDED.description,
  website_url = EXCLUDED.website_url, is_active = EXCLUDED.is_active,
  chain = EXCLUDED.chain, chain_id = EXCLUDED.chain_id;

INSERT INTO defi_module_actions (id, module_id, name, pallet, call, description, param_schema, risk_level, is_active) VALUES
${actionRows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, name = EXCLUDED.name, description = EXCLUDED.description,
  param_schema = EXCLUDED.param_schema, risk_level = EXCLUDED.risk_level,
  is_active = EXCLUDED.is_active;

INSERT INTO defi_pairs (id, action_id, token_in_id, token_out_id) VALUES
${pairRows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  action_id = EXCLUDED.action_id, token_in_id = EXCLUDED.token_in_id,
  token_out_id = EXCLUDED.token_out_id;
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, sql);
console.log(`wrote ${OUT}`);
console.log(`modules=${moduleRows.length} actions=${actionRows.length} pairs=${pairRows.length}`);
