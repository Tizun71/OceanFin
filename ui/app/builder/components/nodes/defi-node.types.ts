import type { NodeProps } from "reactflow";
import type { Action, Module } from "@/types/defi";

export type DefiOperationType = Action["operation_type"];

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
  max_ltv?: number;

  apy?: number;
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

  label?: string;
  title?: string;

  module?: Module | null;
  action?: Action | null;

  config?: DefiNodeConfig;

  onDelete?: (id: string) => void;
};

export type NormalizedDefiNodeData = {
  type: DefiOperationType;

  title: string;
  protocolName: string;

  tokenInSymbol: string;
  tokenOutSymbol: string;

  amount: number;
  amountOut: number;

  slippage?: number;
  apy?: number;
  ltv?: number;

  isConfigured: boolean;
};

export type DefiNodeProps = NodeProps<DefiNodeData>;