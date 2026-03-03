'use client';

import { useState } from 'react';
import { useAccount } from '@luno-kit/react';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { stringToHex } from '@polkadot/util';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { User } from '@/types/user.interface';

interface UserSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: User) => void;
}

export function UserSignupDialog({ open, onOpenChange, onSuccess }: UserSignupDialogProps) {
  const { address } = useAccount();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignAndCreate = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      const message = `Welcome to OceanFin!\n\nWallet Address: ${address}\nTimestamp: ${new Date().toISOString()}\n\nPlease sign this message to verify wallet ownership.`;

      await web3Enable('OceanFin');
      const injector = await web3FromAddress(address);

      if (!injector.signer.signRaw) {
        throw new Error('Wallet does not support message signing');
      }

      const { signature } = await injector.signer.signRaw({
        address,
        data: stringToHex(message),
        type: 'bytes',
      });

      const response = await api.post('/users', {
        walletAddress: address,
        chainId: 0,
        username: username.trim() || undefined,
        signature,
      });

      const newUser: User = response.data;
      
      toast.success('Account created successfully!');
      onSuccess(newUser);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[500px] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-[#00C2CB]/20 backdrop-blur-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#00C2CB] to-[#00A6A6] bg-clip-text text-transparent">
            Welcome to OceanFin!
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            This is your first time connecting this wallet. Please sign a message to verify ownership and create your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-address" className="text-slate-200">Wallet Address</Label>
            <Input
              id="wallet-address"
              value={address || ''}
              disabled
              className="font-mono text-sm bg-slate-800/50 border-slate-700 text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-200">
              Display Name <span className="text-slate-400">(optional)</span>
            </Label>
            <Input
              id="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-[#00C2CB] focus:ring-[#00C2CB]/20"
            />
            <p className="text-xs text-slate-400">
              You can change this later
            </p>
          </div>

          <div className="rounded-lg bg-slate-800/30 border border-slate-700/50 p-4 space-y-2">
            <p className="text-sm font-medium text-[#00C2CB]">You will need to:</p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>Sign a message to verify wallet ownership</li>
              <li>No gas fees required for signing</li>
              <li>Your information is stored securely</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSignAndCreate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00C2CB] to-[#00A6A6] hover:from-[#00A6A6] hover:to-[#008B8B] text-white shadow-lg shadow-[#00C2CB]/20"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              'Sign & Create Account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
