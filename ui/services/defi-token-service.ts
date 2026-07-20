import { api, API_ENDPOINTS } from './api';

/** A token row from the backend registry (defi_token). */
export interface DefiTokenDto {
  id: string;
  name: string;
  asset_id: number | null;
  chain: string;
  chain_id: number | null;
  /** ERC-20 address, lowercase. Null for substrate tokens. */
  address: string | null;
  /** ERC-20 decimals. Null for substrate tokens. */
  decimals: number | null;
}

/** Fetch the token registry, optionally scoped to a chain slug. */
export const getDefiTokens = async (chain?: string): Promise<DefiTokenDto[]> => {
  const res = await api.get(API_ENDPOINTS.DEFI_TOKENS.LIST(chain));
  return res.data ?? [];
};
