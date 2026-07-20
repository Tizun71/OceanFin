-- GENERATED FILE — do not edit by hand.
-- Source: @bgd-labs/aave-address-book via scripts/generate-token-seed.mjs
-- Regenerate: node scripts/generate-token-seed.mjs
--
-- Aave v3 reserve tokens for every supported EVM chain. Substrate (Hydration)
-- tokens are seeded separately: they key off asset_id, not an ERC-20 address.
-- Idempotent via the (chain, address) unique index from migration 0003.

INSERT INTO defi_token (name, chain, chain_id, address, decimals) VALUES
  ('DAI.e', 'avalanche', 43114, '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', 18),
  ('LINK.e', 'avalanche', 43114, '0x5947bb275c521040051d82396192181b413227a3', 18),
  ('USDC', 'avalanche', 43114, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6),
  ('WBTC.e', 'avalanche', 43114, '0x50b7545627a5162f82a992c33b87adc75187b218', 8),
  ('WETH.e', 'avalanche', 43114, '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', 18),
  ('USDT', 'avalanche', 43114, '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', 6),
  ('AAVE.e', 'avalanche', 43114, '0x63a72806098bd3d9520cc43356dd78afe5d386d9', 18),
  ('WAVAX', 'avalanche', 43114, '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', 18),
  ('sAVAX', 'avalanche', 43114, '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be', 18),
  ('FRAX', 'avalanche', 43114, '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64', 18),
  ('MAI', 'avalanche', 43114, '0x5c49b268c9841aff1cc3b0a418ff5c3442ee3f3b', 18),
  ('BTC.b', 'avalanche', 43114, '0x152b9d0fdc40c096757f570a51e494bd4b943e50', 8),
  ('AUSD', 'avalanche', 43114, '0x00000000efe302beaa2b3e6e1b18d08d69a9012a', 6),
  ('GHO', 'avalanche', 43114, '0xfc421ad3c883bf9e7c4f42de845c4e4405799e73', 18),
  ('EURC', 'avalanche', 43114, '0xc891eb4cbdeff6e073e859e987815ed1505c2acd', 6),
  ('USDe', 'avalanche', 43114, '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34', 18),
  ('sUSDe', 'avalanche', 43114, '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2', 18),
  ('wrsETH', 'avalanche', 43114, '0x7bfd4ca2a6cf3a3fddd645d10b323031afe47ff0', 18),
  ('WETH', 'base', 8453, '0x4200000000000000000000000000000000000006', 18),
  ('cbETH', 'base', 8453, '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', 18),
  ('USDbC', 'base', 8453, '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', 6),
  ('wstETH', 'base', 8453, '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452', 18),
  ('USDC', 'base', 8453, '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', 6),
  ('weETH', 'base', 8453, '0x04c0599ae5a44757c0af6f9ec3b93da8976c150a', 18),
  ('cbBTC', 'base', 8453, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', 8),
  ('ezETH', 'base', 8453, '0x2416092f143378750bb29b79ed961ab195cceea5', 18),
  ('GHO', 'base', 8453, '0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee', 18),
  ('wrsETH', 'base', 8453, '0xedfa23602d0ec14714057867a78d01e94176bea0', 18),
  ('LBTC', 'base', 8453, '0xecac9c5f704e954931349da37f60e39f515c11c1', 8),
  ('EURC', 'base', 8453, '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42', 6),
  ('AAVE', 'base', 8453, '0x63706e401c06ac8513145b7687a14804d17f814b', 18),
  ('tBTC', 'base', 8453, '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b', 18),
  ('syrupUSDC', 'base', 8453, '0x660975730059246a68521a3e2fbd4740173100f5', 6),
  ('DAI', 'arbitrum', 42161, '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', 18),
  ('LINK', 'arbitrum', 42161, '0xf97f4df75117a78c1a5a0dbb814af92458539fb4', 18),
  ('USDC.e', 'arbitrum', 42161, '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', 6),
  ('WBTC', 'arbitrum', 42161, '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', 8),
  ('WETH', 'arbitrum', 42161, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', 18),
  ('USDT', 'arbitrum', 42161, '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', 6),
  ('AAVE', 'arbitrum', 42161, '0xba5ddd1f9d7f570dc94a51479a000e3bce967196', 18),
  ('EURS', 'arbitrum', 42161, '0xd22a58f79e9481d1a88e00c343885a588b34b68b', 2),
  ('wstETH', 'arbitrum', 42161, '0x5979d7b546e38e414f7e9822514be443a4800529', 18),
  ('MAI', 'arbitrum', 42161, '0x3f56e0c36d275367b8c502090edf38289b3dea0d', 18),
  ('rETH', 'arbitrum', 42161, '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8', 18),
  ('LUSD', 'arbitrum', 42161, '0x93b346b6bc2548da6a1e7d98e9a421b42541425b', 18),
  ('USDC', 'arbitrum', 42161, '0xaf88d065e77c8cc2239327c5edb3a432268e5831', 6),
  ('FRAX', 'arbitrum', 42161, '0x17fc002b466eec40dae837fc4be5c67993ddbd6f', 18),
  ('ARB', 'arbitrum', 42161, '0x912ce59144191c1204e64559fe8253a0e49e6548', 18),
  ('weETH', 'arbitrum', 42161, '0x35751007a407ca6feffe80b3cb397736d2cf4dbe', 18),
  ('GHO', 'arbitrum', 42161, '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33', 18),
  ('ezETH', 'arbitrum', 42161, '0x2416092f143378750bb29b79ed961ab195cceea5', 18),
  ('rsETH', 'arbitrum', 42161, '0x4186bfc76e2e237523cbc30fd220fe055156b41f', 18),
  ('tBTC', 'arbitrum', 42161, '0x6c84a8f1c29108f47a79964b5fe888d4f4d0de40', 18)
-- The 0003 unique index is partial, so the predicate must be repeated here for
-- Postgres to infer it.
ON CONFLICT (chain, address) WHERE address IS NOT NULL DO UPDATE SET
  name = EXCLUDED.name,
  chain_id = EXCLUDED.chain_id,
  decimals = EXCLUDED.decimals;
