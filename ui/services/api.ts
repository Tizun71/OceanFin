import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
};
