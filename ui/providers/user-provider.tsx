'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWalletUser } from '@/hooks/use-wallet-user';
import { UserSignupDialog } from '@/components/shared/user-signup-dialog';
import { User } from '@/types/user.interface';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, error, needsSignup, checkUser, setUser } = useWalletUser();
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  useEffect(() => {
    if (needsSignup) {
      setShowSignupDialog(true);
    }
  }, [needsSignup]);

  const handleSignupSuccess = (newUser: User) => {
    setUser(newUser);
    setShowSignupDialog(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        refreshUser: checkUser,
      }}
    >
      {children}
      
      <UserSignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        onSuccess={handleSignupSuccess}
      />
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
