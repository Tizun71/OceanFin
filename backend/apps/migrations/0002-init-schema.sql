-- Migration 0002: full initial schema for self-hosted Postgres (replaces Supabase).
-- Derived from domain entities + repository queries. Chain columns (0001) folded in.
-- Idempotent via IF NOT EXISTS. Apply after connecting to a fresh Postgres DB.

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- ── users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  chain_id       integer,
  username       text
);

-- ── strategies (marketplace listing) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS strategies (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategist_name   text,
  strategist_handle text,
  apy               numeric,
  tags              text[] DEFAULT '{}',
  assets            text[] DEFAULT '{}',
  agents            text[] DEFAULT '{}',
  chains            text[] DEFAULT '{}'
);

-- ── activities (execution tracking) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  strategy_id  text NOT NULL,
  tx_hash      text[] DEFAULT '{}',
  status       text NOT NULL DEFAULT 'PENDING',
  metadata     jsonb,
  current_step integer,
  total_steps  integer,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activities_strategy ON activities (strategy_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities (user_address);

-- ── defi_token ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_token (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name     text NOT NULL,
  asset_id integer,
  chain    varchar NOT NULL DEFAULT 'polkadot',
  chain_id integer
);

-- ── defi_modules ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_modules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  protocol     text,
  category     text,
  parachain_id integer,
  icon_url     text,
  description  text,
  website_url  text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  chain        varchar NOT NULL DEFAULT 'polkadot',
  chain_id     integer
);
CREATE INDEX IF NOT EXISTS idx_defi_modules_chain ON defi_modules (chain);

-- ── defi_module_actions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_module_actions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    uuid NOT NULL REFERENCES defi_modules (id) ON DELETE CASCADE,
  name         text,
  pallet       text,
  call         text,
  description  text,
  param_schema jsonb,
  risk_level   text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_module_actions_module ON defi_module_actions (module_id);

-- ── defi_pairs (named FKs match the PostgREST hints used previously) ──────
CREATE TABLE IF NOT EXISTS defi_pairs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id    uuid NOT NULL REFERENCES defi_module_actions (id) ON DELETE CASCADE,
  token_in_id  uuid CONSTRAINT defi_pairs_token_in_id_fkey REFERENCES defi_token (id),
  token_out_id uuid CONSTRAINT defi_pairs_token_out_id_fkey REFERENCES defi_token (id)
);
CREATE INDEX IF NOT EXISTS idx_defi_pairs_action ON defi_pairs (action_id);

-- ── defi_action_required ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_action_required (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id          uuid NOT NULL,
  module_id          uuid NOT NULL,
  action_required_id uuid NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_action_required_action ON defi_action_required (action_id);

-- ── defi_strategies ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_strategies (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           text,
  name               text,
  description        text,
  status             text,
  is_public          boolean NOT NULL DEFAULT false,
  chain_context      text,
  current_version_id uuid,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_defi_strategies_owner ON defi_strategies (owner_id);

-- ── defi_strategy_versions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_strategy_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id    uuid NOT NULL REFERENCES defi_strategies (id) ON DELETE CASCADE,
  version        integer NOT NULL,
  workflow_json  jsonb,
  workflow_graph jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_strategy_versions_strategy ON defi_strategy_versions (strategy_id);

-- ── defi_strategy_executions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_strategy_executions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_version_id uuid NOT NULL REFERENCES defi_strategy_versions (id) ON DELETE CASCADE,
  extrinsic_hash      text,
  execution_status    text,
  executed_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_executions_version ON defi_strategy_executions (strategy_version_id);

-- ── defi_execution_step_results ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_execution_step_results (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id  uuid NOT NULL REFERENCES defi_strategy_executions (id) ON DELETE CASCADE,
  step_index    integer,
  parachain_id  integer,
  pallet        text,
  call          text,
  status        text,
  output_assets jsonb,
  error_message text
);
CREATE INDEX IF NOT EXISTS idx_step_results_execution ON defi_execution_step_results (execution_id);

-- ── defi_strategy_simulation_snapshots ───────────────────────────────────
CREATE TABLE IF NOT EXISTS defi_strategy_simulation_snapshots (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_version_id uuid NOT NULL REFERENCES defi_strategy_versions (id) ON DELETE CASCADE,
  snapshot_type       text,
  estimated_outputs   jsonb,
  estimated_weight    numeric,
  estimated_fee       numeric,
  chain_state_ref     text,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_snapshots_version ON defi_strategy_simulation_snapshots (strategy_version_id);
