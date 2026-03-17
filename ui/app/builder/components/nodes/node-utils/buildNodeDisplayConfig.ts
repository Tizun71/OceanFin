import type { DefiNodeData, NodeDisplayConfig } from "../node-types";

function toPercentString(value: unknown, fallback?: string) {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "string") {
    return value.includes("%") ? value : `${value}%`;
  }

  if (typeof value === "number") {
    return `${value}%`;
  }

  return fallback;
}

export function buildNodeDisplayConfig(data: DefiNodeData): NodeDisplayConfig {
  const config = data?.config ?? {};
  const estimated = data?.estimatedData ?? {};

  return {
    tokenInSymbol:
      estimated?.tokenInSymbol ??
      config?.tokenInSymbol ??
      config?.tokenIn ??
      config?.fromTokenSymbol,

    tokenOutSymbol:
      estimated?.tokenOutSymbol ??
      config?.tokenOutSymbol ??
      config?.tokenOut ??
      config?.toTokenSymbol,

    amount:
      estimated?.amount ??
      config?.amount ??
      config?.amountIn,

    amountOut:
      estimated?.amountOut ??
      config?.amountOut ??
      estimated?.estimatedAmountOut,

    tokenInIcon:
      estimated?.tokenInIcon ??
      config?.tokenInIcon ??
      config?.fromTokenIcon,

    tokenOutIcon:
      estimated?.tokenOutIcon ??
      config?.tokenOutIcon ??
      config?.toTokenIcon,

    protocolIcon:
      estimated?.protocolIcon ??
      config?.protocolIcon,

    slippage: toPercentString(
      estimated?.slippage ?? config?.slippage,
      "1%"
    ),

    apy: toPercentString(
      estimated?.apy ?? config?.apy,
      "10%"
    ),

    ltv: toPercentString(
      estimated?.ltv ?? config?.ltv,
      "80%"
    ),

    collateralTokenSymbol:
      estimated?.collateralTokenSymbol ??
      config?.collateralTokenSymbol ??
      config?.tokenInSymbol,

    collateralTokenIcon:
      estimated?.collateralTokenIcon ??
      config?.collateralTokenIcon ??
      config?.tokenInIcon,
  };
}