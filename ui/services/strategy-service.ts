import { api, API_ENDPOINTS } from './api';

// Simulate strategy
export const simulateStrategy = async (strategy: any, amount: number) => {
  if (!strategy?.id) throw new Error('Invalid strategy');

  const assetIn = strategy.inputAssetId ?? 2;
  const iterations = strategy.iterations ?? 3;
  const assetIdIn = strategy.assetIdIn ?? 5;

  try {
    const res = await api.get(API_ENDPOINTS.STRATEGIES.SIMULATE(strategy.id), {
      params: {
        amountIn: amount,
        assetIn,
        iterations,
        assetIdIn,
      },
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
    return res.data;
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
