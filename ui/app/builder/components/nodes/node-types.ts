export type NodeVariant =
  | "swap"
  | "join_strategy"
  | "supply"
  | "borrow"
  | "default";

export type NodeDisplayConfig = {
  tokenInSymbol?: string;
  tokenOutSymbol?: string;

  amount?: number | string;
  amountOut?: number | string;

  tokenInIcon?: string;
  tokenOutIcon?: string;
  protocolIcon?: string;

  slippage?: string;
  apy?: string;
  ltv?: string;

  collateralTokenSymbol?: string;
  collateralTokenIcon?: string;
};

export type DefiNodeData = {
  id?: string;
  module?: {
    name?: string;
    key?: string;
  };
  action?: {
    name?: string;
    key?: string;
    type?: string;
  };
  config?: Record<string, any>;
  estimatedData?: Record<string, any>;
  onDelete?: (id?: string) => void;
};

export type DefiNodeProps = {
  data: DefiNodeData;
  selected: boolean;
};