import type { NodeProps } from "reactflow";

export type DefiOperationType =
  | "SWAP"
  | "JOIN_STRATEGY"
  | "SUPPLY"
  | "BORROW";

export type DefiEstimate = {
  operation_type?: DefiOperationType;
  token_in_id?: string;
  token_out_id?: string;
  amount_in?: number;
  amount_out?: number;
  slippage?: number;
  supply_apy?: number;
  borrow_apy?: number;
  ltv?: number;

  apy?: number;
  max_ltv?: number;
};

export type DefiNodeConfig = {
 
  type?: DefiOperationType;


  tokenInId?: string;
  tokenOutId?: string;

  
  tokenInSymbol?: string;
  tokenOutSymbol?: string;


  amount?: number | string;
  amountOut?: number | string;
  apy?: number;
  slippage?: number;
  ltv?: number;


  estimate?: DefiEstimate;
};

export type DefiNodeData = {
  id: string;
  module?: {
    name?: string;
  };
  action?: {
    name?: string;
    type?: DefiOperationType | string;
  };


  config?: DefiNodeConfig;


  estimate?: DefiEstimate;

  onDelete?: (id: string) => void;
};

export type NormalizedDefiNodeData = {
  type: DefiOperationType;
  title: string;
  protocolName: string;

  tokenInSymbol: string;
  tokenOutSymbol?: string;

  amountIn?: number | string;
  amountOut?: number | string;

  slippage?: number;
  apy?: number;
  ltv?: number;

  isConfigured: boolean;
};

export type DefiNodeProps = NodeProps<DefiNodeData>;