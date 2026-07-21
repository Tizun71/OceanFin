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
import { AaveV3Avalanche } from '@bgd-labs/aave-address-book';
import { deterministicUuid } from './lib/deterministic-uuid.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'seeds', '0002-defi-modules.sql');

// Avalanche-only builder palette. Only protocols with a live client-side data
// path (ui/lib/evm) are seeded: Aave V3 (on-chain reserves/rates + execution)
// and Trader Joe (on-chain lbQuoter). Token addresses come from the Aave V3
// Avalanche market.
const CHAINS = {
  avalanche: { chainId: 43114, market: AaveV3Avalanche },
};

const SWAP_CHAINS = ['avalanche'];

// Swap routing hubs. Pairing every token with every other token would seed
// hundreds of combinations that have no real liquidity; DEXes route through
// these hubs anyway. First match per chain wins, missing symbols are skipped.
const SWAP_HUBS = {
  avalanche: ['WAVAX', 'WETHe', 'USDC'],
};

// Benqi ERC-20 lending markets (lowercased underlying addresses). Kept in sync
// with the `benqi.markets` map in ui/config/chains/chain-registry.ts.
const BENQI_MARKET_ADDRESSES = [
  '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be', // sAVAX
  '0x152b9d0fdc40c096757f570a51e494bd4b943e50', // BTC.b
  '0x50b7545627a5162f82a992c33b87adc75187b218', // WBTC.e
  '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH.e
  '0x5947bb275c521040051d82396192181b413227a3', // LINK.e
  '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // USDT
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
  '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // DAI.e
];

const MODULES = [
  {
    key: 'aave-v3',
    name: 'Aave V3',
    protocol: 'AAVE',
    category: 'LENDING',
    description: 'Supply collateral and borrow against it on Aave v3.',
    website: 'https://aave.com',
    icon: '/icons/agents/aave.png',
    chains: Object.keys(CHAINS),
    actions: [
      { name: 'Supply', risk: 'LOW', description: 'Deposit a token as collateral.' },
      { name: 'Borrow', risk: 'MEDIUM', description: 'Borrow a token against supplied collateral.' },
    ],
  },
  {
    key: 'benqi',
    name: 'Benqi',
    protocol: 'BENQI',
    category: 'LENDING',
    description: 'Supply collateral and borrow against it on Benqi, the native Avalanche money market.',
    website: 'https://benqi.fi',
    icon: '/icons/agents/benqi.png',
    chains: ['avalanche'],
    // Only Benqi's ERC-20 qiToken markets (must match the `markets` map in
    // ui/config/chains/chain-registry.ts). Native AVAX (qiAVAX) is excluded —
    // it needs the payable mint path, so WAVAX is not a Benqi builder market.
    tokenAddresses: BENQI_MARKET_ADDRESSES,
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
    icon: '/icons/agents/trader-joe.png',
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

    // Modules may restrict their token universe (e.g. Benqi supports fewer
    // markets than the full Aave reserve list).
    const allow = mod.tokenAddresses ? new Set(mod.tokenAddresses) : null;
    const tokens = tokensOf(slug).filter((t) => !allow || allow.has(t.address));

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
