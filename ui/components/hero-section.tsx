"use client"

import { PolkadotLogo } from "./polkadot-logo";
import { WalletButton } from "./shared/wallet-button";

export function HeroSection() {
  return (
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
          <WalletButton /> 
        </div>
      </div>
    </header>
  );
}
