import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/user-service';
import { User } from '@/types/user.interface';

export const useCurrentUser = (
  walletAddress: string | undefined,
  options?: {
    enabled?: boolean;
    useHeader?: boolean;
  }
) => {
  return useQuery<User, Error>({
    queryKey: ['user', 'me', walletAddress],
    queryFn: () => getCurrentUser(walletAddress!, options?.useHeader),
    enabled: !!walletAddress && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
