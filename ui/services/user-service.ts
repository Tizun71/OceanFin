import { api, API_ENDPOINTS } from "./api"

export const isEvmAccountBound = async (substrateAddress: string) => {
     const res = await api.get(API_ENDPOINTS.USERS.EVM_BINDING(substrateAddress));
     return res.data;
}