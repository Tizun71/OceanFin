import { ActivityFilter } from '@/types/activity.interface';
import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const API_ENDPOINTS = {
  STRATEGIES: {
    LIST: () => `/strategies`,
    GET: (id: string) => `/strategies/${id}`,
    UPDATE: (id: string) => `/strategies/${id}`,
    SIMULATE: (id: string) => `/strategies/${id}/simulate`,
  },

  ACTIVITIES: {
    LIST: (filter?: ActivityFilter) => {
      const params = new URLSearchParams();
      if (filter?.userAddress) params.append("userAddress", filter.userAddress);
      if (filter?.strategyId) params.append("strategyId", filter.strategyId);

      return `/activities?${params.toString()}`;
    },
    GET: (id: string) => `/activities/${id}`,
    CREATE: () => `/activities`,
    UPDATE_PROGRESS: () => `/activities/progress`,
    RESUME: (id: string) => `/activities/progress/${id}`,
  },

  USERS: {
    EVM_BINDING: (substrateAddress: string) => `/users/evm-binding/${substrateAddress}`,
    BALANCE: (substrateAddress: string, tokenId: string) => `/users/balance/${substrateAddress}/${tokenId}`,
  }
};
