"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, Layers, Menu, Sparkles, Workflow, X } from "lucide-react";
import { WalletButton } from "./shared/wallet-button";
import { ChainSelector } from "./shared/chain-selector";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { usePreloader } from "@/providers/preloader-provider";

export function HeroSection() {
  const pathname = usePathname();
  const router = useRouter();
  const { show } = usePreloader();
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
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

    // passive: the handler never calls preventDefault, and without this flag the
    // browser must block scrolling on every frame to wait and see.
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    // Don't show loader if already on the same page
    if (pathname === href) {
      return;
    }
    
    e.preventDefault();
    show(); // Show loader
    router.push(href);
  };

  // Sentence case: the previous ALL CAPS labels slow reading (word shapes are
  // lost) and read as shouting in a nav bar.
  const navItems = [
    { icon: Layers, label: "Strategies", href: "/" },
    { icon: Workflow, label: "Builder", href: "/builder" },
    { icon: Bookmark, label: "Your strategies", href: "/strategy" },
    { icon: Sparkles, label: "Prompt", href: "/prompt" },
  ];

  // Close the mobile sheet whenever the route changes, otherwise it stays
  // open over the page the user just navigated to.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: visible || menuOpen ? 0 : -100, opacity: visible || menuOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-0 w-full flex justify-center px-3 z-50"
    >
      <div
        className="
          w-full max-w-[1200px]
          rounded-2xl md:rounded-full
          backdrop-blur-xl
          bg-background/60
          border border-white/10
          shadow-lg
          transition-colors duration-300
          hover:border-accent/25
        "
      >
        <div className="flex items-center justify-between gap-4 px-4 md:px-8 py-2.5">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-6 lg:gap-10 min-w-0">
            <Link
              href="/"
              aria-label="Ocean Fin home"
              className="group relative flex items-center shrink-0 rounded-lg"
            >
              <Image
                src="/logo-ocean-fin.svg"
                alt=""
                width={40}
                height={40}
                priority
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <nav aria-label="Main" className="hidden md:flex items-center gap-1 relative">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(item.href, e)}
                    // Colour alone previously signalled the current page.
                    // aria-current exposes it to assistive tech too.
                    aria-current={isActive ? "page" : undefined}
                    className={`
                      relative flex items-center gap-2 px-3 py-2
                      text-sm font-medium rounded-lg whitespace-nowrap
                      transition-colors duration-200
                      ${
                        isActive
                          ? "text-accent-light bg-white/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }
                    `}
                  >
                    {Icon && <Icon className="w-4 h-4" aria-hidden />}
                    <span>{item.label}</span>

                    {isActive && (
                      <motion.span
                        layoutId="active-nav-underline"
                        className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-accent-light rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Chain + Wallet */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden sm:block">
              <ChainSelector />
            </div>
            <WalletButton />

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden grid place-items-center size-10 rounded-lg text-foreground transition-colors hover:bg-white/5"
            >
              {menuOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
            </button>
          </div>
        </div>

        {/* Mobile navigation. Below md the four nav links previously stayed in
            the flex row and overflowed the viewport with no way to reach them. */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav
              id="mobile-nav"
              aria-label="Main"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <ul className="flex flex-col p-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={(e) => handleNavClick(item.href, e)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "text-accent-light bg-white/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" aria-hidden />}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="sm:hidden px-3 pt-2 pb-1">
                  <ChainSelector />
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
