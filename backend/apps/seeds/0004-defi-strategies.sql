-- Executable Avalanche workflows backing the marketplace rows in 0003-strategies.sql.
--
-- Step shape matches ui/types/strategy.type.ts (Step/Token) so ui/lib/evm/build-evm-plan.ts
-- can turn each step into a real transaction: SUPPLY/BORROW/ENABLE_E_MODE hit the Aave V3
-- pool from the chain registry, SWAP is re-quoted against Trader Joe V2.2 right before
-- signing. Token address/decimals are the real Avalanche reserves (see 0001-defi-token.sql);
-- without them build-evm-plan throws "EVM step is missing token address/decimals".
--
-- Steps carry no `amount`: position sizing depends on the user's capital and the live
-- health factor, so amounts are filled in at simulation/execution time, not seeded.
--
-- ENABLE_E_MODE carries the category *label*, not an id. build-evm-plan requires an
-- on-chain-resolved category id ("never hardcode") — the label is what the resolver
-- matches against the market's e-mode categories. On Avalanche today "AVAX correlated"
-- is category 2 at 93% LTV / 95% liquidation threshold, but ids are governance-mutable.

INSERT INTO defi_strategies (id, owner_id, name, description, status, is_public, chain_context, current_version_id) VALUES
  ('a7c31e00-0001-4a10-9a01-0000000000a1', 'system', 'sAVAX Leveraged Staking (E-Mode)',
   'Supply sAVAX on Aave V3 under the AVAX-correlated e-mode, borrow WAVAX, swap back to sAVAX and re-supply for three loops. Earns BENQI staking yield on the levered position minus the WAVAX borrow cost.',
   'ACTIVE', true, 'avalanche', 'b7c31e00-0001-4a10-9a01-0000000000b1'),
  ('a7c31e00-0002-4a10-9a01-0000000000a2', 'system', 'sAVAX Conservative Loop',
   'The same sAVAX/WAVAX loop without e-mode: two loops at 40% LTV against a 50% cap, trading yield for a wider liquidation buffer.',
   'ACTIVE', true, 'avalanche', 'b7c31e00-0002-4a10-9a01-0000000000b2'),
  ('a7c31e00-0003-4a10-9a01-0000000000a3', 'system', 'USDC Supply on Aave V3',
   'Single-step USDC deposit into the Aave V3 Avalanche market. No borrowing, no liquidation risk, earns the reserve supply rate.',
   'ACTIVE', true, 'avalanche', 'b7c31e00-0003-4a10-9a01-0000000000b3'),
  ('a7c31e00-0004-4a10-9a01-0000000000a4', 'system', 'USDt Supply on Aave V3',
   'Single-step USDt deposit into the Aave V3 Avalanche market. Same shape as the USDC strategy, different reserve rate.',
   'ACTIVE', true, 'avalanche', 'b7c31e00-0004-4a10-9a01-0000000000b4'),
  ('a7c31e00-0005-4a10-9a01-0000000000a5', 'system', 'USDC Collateral AVAX Carry',
   'Keep USDC as collateral, borrow WAVAX against it and hold the proceeds as sAVAX. Earns the USDC supply rate plus the staking-minus-borrow spread without selling the stablecoin base.',
   'ACTIVE', true, 'avalanche', 'b7c31e00-0005-4a10-9a01-0000000000b5')
ON CONFLICT (id) DO UPDATE SET
  owner_id = EXCLUDED.owner_id, name = EXCLUDED.name, description = EXCLUDED.description,
  status = EXCLUDED.status, is_public = EXCLUDED.is_public,
  chain_context = EXCLUDED.chain_context, current_version_id = EXCLUDED.current_version_id;

INSERT INTO defi_strategy_versions (id, strategy_id, version, workflow_json) VALUES
  (
    'b7c31e00-0001-4a10-9a01-0000000000b1',
    'a7c31e00-0001-4a10-9a01-0000000000a1',
    1,
    '{
      "chain": "avalanche",
      "chainId": 43114,
      "steps": [
        {"step": 1, "type": "ENABLE_E_MODE", "agent": "AAVE", "eModeCategoryLabel": "AVAX correlated"},
        {"step": 2, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 3, "type": "BORROW", "agent": "AAVE", "collateralRatio": 0.75,
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18},
         "tokenOut": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18}},
        {"step": 4, "type": "SWAP", "agent": "TRADER_JOE",
         "tokenIn": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18},
         "tokenOut": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 5, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 6, "type": "BORROW", "agent": "AAVE", "collateralRatio": 0.75,
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18},
         "tokenOut": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18}},
        {"step": 7, "type": "SWAP", "agent": "TRADER_JOE",
         "tokenIn": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18},
         "tokenOut": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 8, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 9, "type": "BORROW", "agent": "AAVE", "collateralRatio": 0.75,
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18},
         "tokenOut": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18}},
        {"step": 10, "type": "SWAP", "agent": "TRADER_JOE",
         "tokenIn": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18},
         "tokenOut": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 11, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}}
      ]
    }'::jsonb
  ),
  (
    'b7c31e00-0002-4a10-9a01-0000000000b2',
    'a7c31e00-0002-4a10-9a01-0000000000a2',
    1,
    '{
      "chain": "avalanche",
      "chainId": 43114,
      "steps": [
        {"step": 1, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 2, "type": "BORROW", "agent": "AAVE", "collateralRatio": 0.4,
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18},
         "tokenOut": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18}},
        {"step": 3, "type": "SWAP", "agent": "TRADER_JOE",
         "tokenIn": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18},
         "tokenOut": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 4, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 5, "type": "BORROW", "agent": "AAVE", "collateralRatio": 0.4,
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18},
         "tokenOut": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18}},
        {"step": 6, "type": "SWAP", "agent": "TRADER_JOE",
         "tokenIn": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18},
         "tokenOut": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 7, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}}
      ]
    }'::jsonb
  ),
  (
    'b7c31e00-0003-4a10-9a01-0000000000b3',
    'a7c31e00-0003-4a10-9a01-0000000000a3',
    1,
    '{
      "chain": "avalanche",
      "chainId": 43114,
      "steps": [
        {"step": 1, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", "symbol": "USDC", "address": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", "decimals": 6}}
      ]
    }'::jsonb
  ),
  (
    'b7c31e00-0004-4a10-9a01-0000000000b4',
    'a7c31e00-0004-4a10-9a01-0000000000a4',
    1,
    '{
      "chain": "avalanche",
      "chainId": 43114,
      "steps": [
        {"step": 1, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", "symbol": "USDt", "address": "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", "decimals": 6}}
      ]
    }'::jsonb
  ),
  (
    'b7c31e00-0005-4a10-9a01-0000000000b5',
    'a7c31e00-0005-4a10-9a01-0000000000a5',
    1,
    '{
      "chain": "avalanche",
      "chainId": 43114,
      "steps": [
        {"step": 1, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", "symbol": "USDC", "address": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", "decimals": 6}},
        {"step": 2, "type": "BORROW", "agent": "AAVE", "collateralRatio": 0.6,
         "tokenIn": {"assetId": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", "symbol": "USDC", "address": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", "decimals": 6},
         "tokenOut": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18}},
        {"step": 3, "type": "SWAP", "agent": "TRADER_JOE",
         "tokenIn": {"assetId": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "symbol": "WAVAX", "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "decimals": 18},
         "tokenOut": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}},
        {"step": 4, "type": "SUPPLY", "agent": "AAVE",
         "tokenIn": {"assetId": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "symbol": "sAVAX", "address": "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", "decimals": 18}}
      ]
    }'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  strategy_id = EXCLUDED.strategy_id, version = EXCLUDED.version,
  workflow_json = EXCLUDED.workflow_json;
