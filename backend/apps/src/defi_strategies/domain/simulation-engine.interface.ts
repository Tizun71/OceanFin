export interface SimulationContext {
  amount_in: number;
  slippage_tolerance: number;
  gas_price?: number;
  current_amount: number;
  total_fee: number;
  warnings: string[];
}

export interface SimulationStepDto {
  step: number;
  type: string;
  agent: string;
  tokenIn: {
    assetId: string;
    symbol: string;
    amount: number;
  },
  tokenOut: {
    assetId: string;
    symbol: string;
    amount: number;
  };
}
export interface SimulationStepResult {
  step_index: number;
  action_type: string;
  agent: string;
  token_in: {
    asset_id: string;
    symbol: string;
    amount: number;
  };
  token_out: {
    asset_id: string;
    symbol: string;
    amount: number;
  };
  fee: number;
  slippage?: number;
  price_impact?: number;
  apy?: number;
  execution_time: string;
}

export interface ActionSimulator {
  simulate(
    step: any,
    context: SimulationContext,
  ): Promise<SimulationStepResult>;
}

export abstract class SimulationEngine {
  abstract simulate(
    workflow_json: any,
    amount_in: number,
    options?: {
      slippage_tolerance?: number;
      gas_price?: number;
    },
  );
}
