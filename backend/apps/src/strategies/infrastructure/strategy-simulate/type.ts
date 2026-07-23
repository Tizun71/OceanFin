import { AGENT, ASSET_ID, ASSET_SYMBOL, STEP_TYPE } from '../helpers';

export interface Token {
  /** Hydration asset id, or the ERC-20 address on EVM chains. */
  assetId: ASSET_ID | string;
  symbol: ASSET_SYMBOL | string;
  amount?: number;
  /** EVM only — ui/lib/evm/build-evm-plan.ts needs both to encode an amount. */
  address?: string;
  decimals?: number;
}

export interface Step {
  step: number;
  type: STEP_TYPE | string;
  agent?: AGENT | string;
  /**
   * EVM lending-protocol selector for the frontend executor (build-evm-plan):
   * 'BENQI', 'AAVE_V4_*', or absent for Aave v3. Simulation itself is
   * protocol-agnostic, but dropping this here would silently route a v4 step at
   * the v3 pool, so it is carried straight through from the workflow.
   */
  protocol?: string;
  tokenIn?: Token;
  tokenOut?: Token;
  /** ENABLE_E_MODE: the category label; the id is resolved on-chain at execution. */
  eModeCategoryLabel?: string;
}

export interface SimulateResult {
  initialCapital: Token;
  loops: number;
  fee: number;
  totalSupply: number;
  totalBorrow: number;
  steps: Step[];
}
