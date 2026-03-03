import { User } from "@/types/user.interface";
import { api, API_ENDPOINTS } from "./api"

export const getCurrentUser = async (walletAddress: string, useHeader: boolean = false): Promise<User> => {
     if (useHeader) {
          const res = await api.get(API_ENDPOINTS.USERS.ME(), {
               headers: {
                    'x-wallet-address': walletAddress
               }
          });
          return res.data;
     } else {
          const res = await api.get(API_ENDPOINTS.USERS.ME(), {
               params: { address: walletAddress }
          });
          return res.data;
     }
};

export const isEvmAccountBound = async (substrateAddress: string) => {
     const res = await api.get(API_ENDPOINTS.USERS.EVM_BINDING(substrateAddress));
     return res.data;
}

export const getTokenBalance = async (substrateAddress: string, tokenId: string) => {
     const res = await api.get(API_ENDPOINTS.USERS.BALANCE(substrateAddress, tokenId));
     return res.data;
};