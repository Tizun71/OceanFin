import { api, API_ENDPOINTS } from "./api"

export const isEvmAccountBound = async (substrateAddress: string) => {
     const res = await api.get(API_ENDPOINTS.USERS.EVM_BINDING(substrateAddress));
     return res.data;
}

export const getTokenBalance = async (substrateAddress: string, tokenId: string) => {
     const res = await api.get(API_ENDPOINTS.USERS.BALANCE(substrateAddress, tokenId));
     return res.data;
};