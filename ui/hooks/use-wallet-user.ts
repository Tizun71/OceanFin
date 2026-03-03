import { useState, useEffect, useCallback } from 'react';
import { useAccount } from '@luno-kit/react';
import { getCurrentUser } from '@/services/user-service';
import { User } from '@/types/user.interface';

interface UseWalletUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  needsSignup: boolean;
  checkUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useWalletUser = (): UseWalletUserReturn => {
  const { address } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [needsSignup, setNeedsSignup] = useState(false);

  const checkUser = useCallback(async () => {
    if (!address) {
      setUser(null);
      setNeedsSignup(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = await getCurrentUser(address);
      setUser(userData);
      setNeedsSignup(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNeedsSignup(true);
        setUser(null);
      } else {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return {
    user,
    isLoading,
    error,
    needsSignup,
    checkUser,
    setUser,
  };
};
