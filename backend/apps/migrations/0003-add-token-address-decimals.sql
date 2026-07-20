-- Migration 0003: ERC-20 metadata on defi_token.
--
-- Why: EVM execution needs the on-chain token address and decimals to encode a
-- transfer/approve amount. ui/lib/evm/build-evm-plan.ts throws
-- "EVM step is missing token address/decimals" without them, so every EVM step
-- (Aave supply/borrow, swaps) fails before this migration.
--
-- address  = ERC-20 contract address, lowercase 0x-hex. NULL for substrate tokens,
--            which are identified by asset_id on Hydration instead.
-- decimals = ERC-20 decimals (USDC 6, WETH 18, ...). NULL for substrate tokens.

ALTER TABLE IF EXISTS defi_token
  ADD COLUMN IF NOT EXISTS address  text,
  ADD COLUMN IF NOT EXISTS decimals smallint;

-- An EVM token is unusable without both fields, and a substrate token has no
-- business carrying an ERC-20 address. Enforce that split at the DB level so a
-- half-populated row can never reach the execution path.
ALTER TABLE IF EXISTS defi_token
  DROP CONSTRAINT IF EXISTS defi_token_evm_metadata_check;

ALTER TABLE IF EXISTS defi_token
  ADD CONSTRAINT defi_token_evm_metadata_check CHECK (
    (chain = 'polkadot' AND address IS NULL AND decimals IS NULL)
    OR
    (chain <> 'polkadot' AND address IS NOT NULL AND decimals IS NOT NULL)
  );

-- Addresses are compared case-insensitively everywhere (viem returns checksummed
-- values); store them lowercase so lookups and uniqueness agree.
ALTER TABLE IF EXISTS defi_token
  DROP CONSTRAINT IF EXISTS defi_token_address_lowercase_check;

ALTER TABLE IF EXISTS defi_token
  ADD CONSTRAINT defi_token_address_lowercase_check CHECK (
    address IS NULL OR address = lower(address)
  );

-- One row per token per chain. Partial index so substrate rows (address NULL)
-- are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_defi_token_chain_address
  ON defi_token (chain, address)
  WHERE address IS NOT NULL;
