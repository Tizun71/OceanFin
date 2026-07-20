import { api, API_ENDPOINTS } from './api';
import { resolveStrategyInputToken, type StrategyInputToken } from '@/lib/strategy-input-token';

// Simulate strategy. Callers that already resolved the input token (chain-aware)
// should pass it; otherwise it falls back to substrate resolution.
export const simulateStrategy = async (
  strategy: any,
  amount: number,
  inputToken?: StrategyInputToken,
) => {
  if (!strategy?.id) throw new Error('Invalid strategy');

  // Simulate against the strategy's own input token, not a hardcoded default.
  const token = inputToken ?? resolveStrategyInputToken(strategy);

  // EVM strategies are simulated from their seeded workflow server-side, which
  // already knows every token — only the amount is needed. Substrate strategies
  // still address assets by Hydration asset id.
  const isEvmToken = !!token.address || !!token.isNative;
  if (!isEvmToken && !token.assetId) {
    throw new Error(
      token.symbol
        ? `No Hydration asset id for input token ${token.symbol}`
        : `Strategy "${strategy.title ?? strategy.id}" declares no input token`,
    );
  }

  const params: Record<string, unknown> = {
    amountIn: amount,
    iterations: strategy.iterations ?? 3,
  };

  if (!isEvmToken) {
    params.assetIn = strategy.inputAssetId ?? 2;
    params.assetIdIn = token.assetId;
  }

  try {
    const res = await api.get(API_ENDPOINTS.STRATEGIES.SIMULATE(strategy.id), {
      params,
    });
    return res.data;
  } catch (e: any) {
    const msg = e?.response?.data || e?.message || 'Simulation failed';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
};

// Fetch all strategies
export const fetchStrategies = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.STRATEGIES.LIST());
    return res.data?.data ?? [];
  } catch (e: any) {
    const msg = e?.response?.data || e?.message || 'Failed to fetch strategies';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
};



// Fetch single strategy by ID
export const getStrategy = async (id: string) => {
  try {
    const res = await api.get(API_ENDPOINTS.STRATEGIES.GET(id));
    return res.data;
  } catch (e: any) {
    const msg = e?.response?.data || e?.message || 'Failed to fetch strategy';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
};

// Fetch strategies with filters
export const fetchStrategiesWithFilters = async (filters: {
  keyword?: string;
  tags?: string[];
}) => {
  const params: any = {};
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.tags?.length) params.tags = filters.tags.join(",");

  const res = await api.get(API_ENDPOINTS.STRATEGIES.LIST(), { params });
  return res.data?.data ?? [];
};


