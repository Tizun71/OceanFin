"use client";

import type {
  DefiNodeData,
  DefiOperationType,
  NormalizedDefiNodeData,
} from "./defi-node.types";

const VALID_TYPES: DefiOperationType[] = [
  "SWAP",
  "SUPPLY",
  "BORROW",
  "JOIN_STRATEGY",
];

function isValidType(value: unknown): value is DefiOperationType {
  return typeof value === "string" && VALID_TYPES.includes(value as DefiOperationType);
}

function resolveTypeFromName(name?: string): DefiOperationType | undefined {
  if (!name) return undefined;

  const upper = name.toUpperCase();

  if (upper.includes("JOIN")) return "JOIN_STRATEGY";
  if (upper.includes("SUPPLY") || upper.includes("DEPOSIT")) return "SUPPLY";
  if (upper.includes("BORROW") || upper.includes("LOAN")) return "BORROW";
  if (upper.includes("SWAP") || upper.includes("EXCHANGE")) return "SWAP";

  return undefined;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function getApy(
  type: DefiOperationType,
  configApy?: number,
  estimate?: DefiNodeData["config"] extends infer C
    ? C extends { estimate?: infer E }
      ? E
      : never
    : never
): number {
  if (typeof configApy === "number" && Number.isFinite(configApy)) {
    return configApy;
  }

  if (!estimate) return 0;

  switch (type) {
    case "SUPPLY":
      return toNumber((estimate as any)?.supply_apy ?? (estimate as any)?.apy, 0);

    case "BORROW":
      return toNumber((estimate as any)?.borrow_apy ?? (estimate as any)?.apy, 0);

    case "JOIN_STRATEGY":
      return toNumber((estimate as any)?.apy, 0);

    case "SWAP":
    default:
      return toNumber((estimate as any)?.apy, 0);
  }
}

export function formatAmount(
  value?: number | string,
  fractionDigits = 2
): string {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;

  if (!Number.isFinite(num)) return "-";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function formatPercent(
  value?: number,
  fractionDigits = 2
): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";

  return `${value.toFixed(fractionDigits)}%`;
}

export function resolveDefiOperationType(
  data: DefiNodeData
): DefiOperationType | undefined {
  const config = data?.config;
  const estimate = config?.estimate;

  const configType = isValidType(config?.type) ? config.type : undefined;

  const actionOperationType = isValidType(data.action?.operation_type)
    ? data.action.operation_type
    : undefined;

  const estimateType = isValidType(estimate?.operation_type)
    ? estimate.operation_type
    : undefined;

  const nameType = resolveTypeFromName(data.action?.name);

  return configType || actionOperationType || estimateType || nameType;
}

export function normalizeDefiNodeData(data: DefiNodeData): NormalizedDefiNodeData {
  const config = data?.config;
  const estimate = config?.estimate;

  const resolvedType = resolveDefiOperationType(data);
  const type: DefiOperationType = resolvedType ?? "SWAP";

  const tokenInSymbol =
    config?.tokenInSymbol ||
    data?.action?.defi_pairs?.[0]?.token_in?.name ||
    "-";

  const tokenOutSymbol =
    config?.tokenOutSymbol ||
    data?.action?.defi_pairs?.[0]?.token_out?.name ||
    "-";

  const amount =
    toNumber(config?.amount, NaN) ||
    toNumber(estimate?.amount_in, 0);

  const amountOut =
    toNumber(config?.amountOut, NaN) ||
    toNumber(estimate?.amount_out, 0);

  const slippage =
    toNumber(config?.slippage, NaN) ||
    toNumber(estimate?.slippage, 0);

  const apy = getApy(type, config?.apy, estimate);

  const ltv =
    toNumber(config?.ltv, NaN) ||
    toNumber(estimate?.ltv, 0);

  const title =
    data?.title ||
    data?.label ||
    data?.action?.name ||
    data?.module?.name ||
    "DeFi Action";

  const protocolName =
    data?.module?.protocol ||
    data?.module?.name ||
    "Unknown Protocol";

  const hasBaseContext = Boolean(data?.action || data?.module);
  const hasResolvedType = Boolean(resolvedType);

  let isConfigured = hasBaseContext && hasResolvedType;

  switch (type) {
    case "SWAP":
      isConfigured = hasBaseContext && hasResolvedType;
      break;

    case "SUPPLY":
      isConfigured = hasBaseContext && hasResolvedType;
      break;

    case "BORROW":
      isConfigured = hasBaseContext && hasResolvedType;
      break;

    case "JOIN_STRATEGY":
      isConfigured = hasBaseContext && hasResolvedType;
      break;

    default:
      isConfigured = false;
  }

  return {
    type,
    isConfigured,

    title,
    protocolName,

    tokenInSymbol,
    tokenOutSymbol,

    amount,
    amountOut,

    slippage,
    apy,
    ltv,
  };
}