"use client"

import { PolkadotLogo } from "./polkadot-logo"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useState } from "react"
import { WalletConnectModal } from "./wallet-connect-modal"

export function HeroSection() {
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  return (
    <>
      <header className="border-b border-primary/20 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-md sticky top-0 z-50 polkadot-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PolkadotLogo />
            <div>
              <h1 className="text-xl font-bold text-[#0f1419]">POLKADOT STRATEGIES</h1>
              <p className="text-xs text-muted-foreground">Powered by Parachain DeFi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
              <Globe className="w-5 h-5" />
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold text-white"
              onClick={() => setWalletModalOpen(true)}
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </>
  )
}
