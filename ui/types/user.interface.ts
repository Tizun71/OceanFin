export interface User {
  id: string;
  walletAddress: string;
  chainId: string;
  username?: string | null;
  createdAt?: string;
}
