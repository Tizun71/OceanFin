import {
  DefiNodeData,
  DefiOperationType,
  NormalizedDefiNodeData,
} from "./defi-node.types";

const formatTitle = (type?: string) => {
  switch (type) {
    case "SWAP":
      return "Swap";
    case "JOIN_STRATEGY":
      return "Join strategy";
    case "SUPPLY":
      return "Supply";
    case "BORROW":
      return "Borrow";
    default:
      return "Defi Action";
  }
};

const VALID_TYPES: DefiOperationType[] = [
  "SWAP",
  "JOIN_STRATEGY",
  "SUPPLY",
  "BORROW",
];

const isValidType = (value?: string): value is DefiOperationType => {
  return !!value && VALID_TYPES.includes(value as DefiOperationType);
};

const resolveTypeFromName = (name?: string): DefiOperationType | undefined => {
  if (!name) return undefined;

  const normalizedName = name.trim().toUpperCase().replace(/\s+/g, "_");

  if (normalizedName.includes("JOIN_STRATEGY")) return "JOIN_STRATEGY";
  if (normalizedName.includes("JOIN") && normalizedName.includes("STRATEGY")) {
    return "JOIN_STRATEGY";
  }

  if (normalizedName.includes("SUPPLY")) return "SUPPLY";
  if (normalizedName.includes("BORROW")) return "BORROW";
  if (normalizedName.includes("SWAP")) return "SWAP";

  return undefined;
};

export function formatAmount(value?: number | string, digits = 2) {
  if (value === undefined || value === null || value === "") return "--";

  const num = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(num)) return "--";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(num);
}

export function formatPercent(value?: number, digits = 0) {
  if (value === undefined || value === null || Number.isNaN(value)) return "--";

  return `${Number(value).toFixed(digits)}%`;
}

/**
 * Helpers: normalize estimate fields because BE can return different shapes
 */
const getEstimateApy = (est: any): number | undefined => {
  const value =
    est?.apy ??
    est?.supply_apy ??
    est?.borrow_apy ??
    est?.estimated_apy ??
    est?.data?.apy ??
    est?.data?.supply_apy ??
    est?.data?.borrow_apy ??
    est?.result?.apy ??
    est?.result?.supply_apy ??
    est?.result?.borrow_apy;

  return value !== undefined && value !== null ? Number(value) : undefined;
};

const getEstimateBorrowApy = (est: any): number | undefined => {
  const value =
    est?.borrow_apy ??
    est?.apy ??
    est?.estimated_apy ??
    est?.data?.borrow_apy ??
    est?.data?.apy ??
    est?.result?.borrow_apy ??
    est?.result?.apy;

  return value !== undefined && value !== null ? Number(value) : undefined;
};

const getEstimateSupplyApy = (est: any): number | undefined => {
  const value =
    est?.supply_apy ??
    est?.apy ??
    est?.estimated_apy ??
    est?.data?.supply_apy ??
    est?.data?.apy ??
    est?.result?.supply_apy ??
    est?.result?.apy;

  return value !== undefined && value !== null ? Number(value) : undefined;
};

const getEstimateLtv = (est: any): number | undefined => {
  const value =
    est?.ltv ??
    est?.max_ltv ??
    est?.borrow_ltv ??
    est?.estimated_ltv ??
    est?.data?.ltv ??
    est?.data?.max_ltv ??
    est?.data?.borrow_ltv ??
    est?.result?.ltv ??
    est?.result?.max_ltv ??
    est?.result?.borrow_ltv;

  return value !== undefined && value !== null ? Number(value) : undefined;
};

const getEstimateAmountIn = (est: any): number | undefined => {
  const value =
    est?.amount_in ??
    est?.amountIn ??
    est?.data?.amount_in ??
    est?.result?.amount_in;

  return value !== undefined && value !== null ? Number(value) : undefined;
};

const getEstimateAmountOut = (est: any): number | undefined => {
  const value =
    est?.amount_out ??
    est?.estimated_amount_out ??
    est?.amountOut ??
    est?.data?.amount_out ??
    est?.result?.amount_out;

  return value !== undefined && value !== null ? Number(value) : undefined;
};

const getEstimateSlippage = (est: any): number | undefined => {
  const value =
    est?.slippage ??
    est?.estimated_slippage ??
    est?.data?.slippage ??
    est?.result?.slippage;

  return value !== undefined && value !== null ? Number(value) : undefined;
};

function resolveDefiOperationType(data: DefiNodeData): DefiOperationType {
  const config = data?.config;
  const estimate = config?.estimate;

  const configType = isValidType(config?.type) ? config.type : undefined;
  const actionType = isValidType(data.action?.type) ? data.action.type : undefined;
  const estimateType = isValidType(estimate?.operation_type)
    ? estimate.operation_type
    : undefined;
  const nameType = resolveTypeFromName(data.action?.name);

  /**
   * Priority:
   * 1. action.name (BE may return wrong type)
   * 2. config.type (saved from ConfigPanel)
   * 3. action.type
   * 4. estimate.operation_type
   */
  return nameType || configType || actionType || estimateType || "SWAP";
}

export function normalizeDefiNodeData(
  data: DefiNodeData
): NormalizedDefiNodeData {
  const config = data?.config;
  const estimate = config?.estimate;

  console.log("RAW NODE DATA:", data);
  console.log("RAW CONFIG:", config);
  console.log("RAW ESTIMATE:", estimate);

  const type = resolveDefiOperationType(data);

  console.log("RESOLVED TYPE:", type);
  console.log("ESTIMATE PAYLOAD:", estimate);

  const title = data.action?.name || formatTitle(type);
  const protocolName = data.module?.name || "Hydration";

  const tokenInSymbol = config?.tokenInSymbol || "HDX";
  const tokenOutSymbol = config?.tokenOutSymbol || "HDX";

  const amountIn = config?.amount ?? getEstimateAmountIn(estimate);
  const amountOut = config?.amountOut ?? getEstimateAmountOut(estimate);

  let apy: number | undefined;
  let slippage: number | undefined;
  let ltv: number | undefined;

  if (type === "SWAP") {
    slippage = config?.slippage ?? getEstimateSlippage(estimate);
  }

  if (type === "SUPPLY") {
    apy = config?.apy ?? getEstimateSupplyApy(estimate) ?? getEstimateApy(estimate);
  }

  if (type === "BORROW") {
    apy = config?.apy ?? getEstimateBorrowApy(estimate) ?? getEstimateApy(estimate);
    ltv = config?.ltv ?? getEstimateLtv(estimate);
  }

  if (type === "JOIN_STRATEGY") {
    apy = config?.apy ?? getEstimateApy(estimate);
  }

  /**
   * Node configured check
   * IMPORTANT: do not use old SWAP-only assumptions
   */
  const isConfigured = (() => {
    if (!config) return false;
    if (!config.tokenInId) return false;
    if (config.amount === undefined || config.amount === null) return false;
    if (!estimate) return false;

    if (type === "SWAP") {
      return !!config.tokenOutId;
    }

    return true;
  })();

  return {
    type,
    title,
    protocolName,
    tokenInSymbol,
    tokenOutSymbol,
    amountIn,
    amountOut,
    slippage,
    apy,
    ltv,
    isConfigured,
  };
}