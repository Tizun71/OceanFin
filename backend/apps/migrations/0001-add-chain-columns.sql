-- Migration 0001: multi-chain columns for an EXISTING database (e.g. legacy Supabase).
-- For a fresh Postgres these columns already exist in 0002-init-schema.sql, so the
-- ALTER TABLE IF EXISTS guards make this a safe no-op when the tables predate 0002.
--
-- Note: defi_strategies already carries chain_context (chain slug) — no change needed there.
-- chain      = chain slug: 'polkadot' | 'avalanche' | 'base' | 'arbitrum'
-- chain_id   = EVM numeric chain id (43114 / 8453 / 42161); NULL for substrate.

ALTER TABLE IF EXISTS defi_token
  ADD COLUMN IF NOT EXISTS chain    varchar NOT NULL DEFAULT 'polkadot',
  ADD COLUMN IF NOT EXISTS chain_id integer;

ALTER TABLE IF EXISTS defi_modules
  ADD COLUMN IF NOT EXISTS chain    varchar NOT NULL DEFAULT 'polkadot',
  ADD COLUMN IF NOT EXISTS chain_id integer;
