"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const wallets = [
  {
    name: "Polkadot.js",
    icon: "P",
    description: "Browser extension wallet",
    color: "bg-primary",
  },
  {
    name: "Talisman",
    icon: "T",
    description: "Multi-chain wallet",
    color: "bg-purple-500",
  },
  {
    name: "SubWallet",
    icon: "S",
    description: "Comprehensive Polkadot wallet",
    color: "bg-green-500",
  },
  {
    name: "Nova Wallet",
    icon: "N",
    description: "Mobile-first wallet",
    color: "bg-blue-500",
  },
]

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const handleConnect = (walletName: string) => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl">Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full justify-start gap-4 h-auto py-4 hover:border-primary/50 transition-all bg-transparent"
              onClick={() => handleConnect(wallet.name)}
            >
              <div
                className={`w-10 h-10 rounded-full ${wallet.color} flex items-center justify-center text-white font-bold`}
              >
                {wallet.icon}
              </div>
              <div className="text-left">
                <div className="font-semibold">{wallet.name}</div>
                <div className="text-xs text-muted-foreground">{wallet.description}</div>
              </div>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          By connecting a wallet, you agree to the Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  )
}
