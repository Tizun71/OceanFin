"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layers } from "lucide-react";
import { WalletButton } from "./shared/wallet-button";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export function HeroSection() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  //scroll window 
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [{ icon: Layers, label: "STRATEGY", href: "/" }];

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-4 left-0 w-full flex justify-center z-50"
    >
      <div
       className="
        flex items-center justify-between
        px-8 py-3
        rounded-full
        backdrop-blur-lg
        bg-transparent
        border border-white/10
        shadow-[0_4px_20px_rgba(0,0,0,0.1)]
        w-[95vw] max-w-[1200px]
        transition-all duration-700
        hover:border-accent/30
        hover:shadow-[0_4px_25px_rgba(0,194,203,0.15)]
      "
      >
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/" className="group relative flex items-center gap-2">
            <div className="relative">
              <Image
                src="/logo-ocean-fin.svg"
                alt="Ocean Fin Logo"
                width={42}
                height={42}
                className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              />
              <div className="absolute inset-0 blur-md bg-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>

          <nav className="flex items-center gap-2 relative">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 
                    text-[15px] font-medium rounded-lg
                    transition-all duration-300
                    ${
                      isActive
                        ? "text-accent-light bg-white/5"
                        : "text-foreground/80 hover:text-accent hover:bg-white/5"
                    }
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="active-nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent-light to-accent rounded-full"
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
    </motion.header>
  );
}
