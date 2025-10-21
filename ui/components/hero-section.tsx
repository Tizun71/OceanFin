"use client"

import { WalletButton } from "./shared/wallet-button";
import SplashCursor from './SplashCursor'
import Image from "next/image";

export function HeroSection() {
  return (
    <header className="border-b border-primary/20 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between transition-all duration-300">
    {/* Logo & Title */}
    <div className="flex items-center gap-4 group">
      <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        <Image
          src="/logo-ocean-fin.svg"
          alt="Ocean Fin Logo"
          width={55}
          height={55}
          className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        />
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#0f1419] transition-colors duration-300 group-hover:text-primary">
          POLKADOT STRATEGIES
        </h1>
        <p className="text-xs text-muted-foreground transition-all duration-300 group-hover:text-primary/70">
          Powered by Parachain DeFi
        </p>
      </div>
    </div>

    {/* Wallet Button */}
    <div className="flex items-center gap-3">
      <div className="transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-xl">
        <WalletButton />
      </div>
    </div>
    <SplashCursor />
  </div>
</header>

  );
}
