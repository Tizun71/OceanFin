"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layers } from "lucide-react";
import { WalletButton } from "./shared/wallet-button";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroSection() {
  const pathname = usePathname();

  const navItems = [
    { icon: Layers, label: "STRATEGY", href: "/" },
  ];

  return (
    <header
      className="fixed top-0 left-0 w-full z-50
      transition-all duration-300"
    >
      <div className="container mx-auto px-6 py-1 flex items-center justify-between">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="group relative flex items-center gap-2">
            <div className="relative">
              <Image
                src="/logo-ocean-fin.svg"
                alt="Ocean Fin Logo"
                width={48}
                height={48}
                className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              />
              {/* Light glow behind logo */}
              <div className="absolute inset-0 blur-md bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 relative">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-[15px] font-medium transition-all duration-300 rounded-md
                    ${
                      isActive
                        ? "text-accent"
                        : "text-gray-600 hover:text-accent/80"
                    }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>

                  {/* Animated underline for active item */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent/60 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Wallet */}
        <div className="flex items-center gap-4">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
