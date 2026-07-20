import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import LunoProvider from "@/providers/luno-provider";
import Footer from "@/components/shared/footer";
import { HeroSection } from "@/components/hero-section";
import { BackgroundAmbient } from "@/components/background-ambient";
import { ToastProvider } from "@/providers/toast-provider";
import { QueryProvider } from "@/providers/query-client-provider";
import { EvmProvider } from "@/providers/evm-provider";
import { ActiveChainProvider } from "@/providers/active-chain-provider";

const UserProvider = dynamic(
  () => import("@/providers/user-provider").then((mod) => ({ default: mod.UserProvider })),
  { ssr: false }
);

import { Montserrat } from 'next/font/google';
import { PreloaderProvider } from "@/providers/preloader-provider";
import { Preloader } from "@/components/preloader";
import "reactflow/dist/style.css"

// 400/700 only forces every mid-weight to synthesise or round off, which flattens
// hierarchy. 500 and 600 give real steps between body, label, and heading.
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: 'swap',
});

// Get base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oceanfin.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Ocean Fin",
  description: "Maximize your DeFi investments with Ocean Fin. AI-powered strategies to earn yield, track performance, and optimize crypto portfolios across the Polkadot ecosystem.",
  keywords: ["Ocean Fin", "Polkadot", "DeFi", "Yield Farming", "Crypto Investment", "AI Strategies", "Blockchain"],
  authors: [{ name: "Ocean Fin Team", url: baseUrl }],
  openGraph: {
    title: "Ocean Fin",
    description: "Maximize your DeFi investments with Ocean Fin. Explore AI-driven strategies and earn yield across the Polkadot ecosystem.",
    url: baseUrl,
    siteName: "Ocean Fin",
    images: [
      {
        url: "/logo-ocean-fin.svg",
        width: 1200,
        height: 630,
        alt: "Ocean Fin",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocean Fin – Polkadot DeFi Strategies & AI Yield Optimization",
    description: "Maximize your DeFi investments with Ocean Fin. Explore AI-driven strategies and earn yield across the Polkadot ecosystem.",
    images: ["/logo-ocean-fin.svg"],
    site: "@OceanFinApp",
    creator: "@OceanFinApp",
  },
  icons: {
    icon: "/logo-ocean-fin.svg",
    apple: "/logo-ocean-fin.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Both font variables must be on the tree for --font-sans to resolve;
          previously only Montserrat was attached and Space Grotesk was dead
          weight. The inline `fontFamily: monospace` that overrode both — and
          rendered the entire product in the system mono face — is gone. */}
      <body
        className={`min-h-dvh font-sans antialiased ${spaceGrotesk.variable} ${montserrat.variable} relative overflow-x-hidden`}
      >
        <QueryProvider>
          <PreloaderProvider>
            <Preloader/>
            {/* The ambient background is already tuned for contrast, so the two
                scrims that used to sit on top of the video (a gradient plus a
                70% flat wash) are gone — they existed only to make the footage
                dark enough to read text against. */}
            <BackgroundAmbient />
            <ToastProvider>
              <EvmProvider>
              {/* LunoProvider stays mounted: the papi execution path
                  (execution-modal / bind-account-modal) still depends on it.
                  All wallet UI is RainbowKit — see WalletButton. */}
              <LunoProvider>
                  <ActiveChainProvider>
                  <UserProvider>
                    <Suspense fallback={
                      <div
                        className="flex items-center justify-center min-h-dvh text-muted-foreground text-sm"
                        role="status"
                        aria-live="polite"
                      >
                        Loading
                      </div>}
                    >
                      <div className="min-h-dvh flex flex-col relative z-10">
                        <a href="#main-content" className="skip-link">
                          Skip to content
                        </a>
                        <HeroSection />
                        {/* pt clears the fixed header; was a magic 30px that let
                            the header overlap page content on smaller screens. */}
                        <main
                          id="main-content"
                          className="flex-1 flex flex-col pt-24 md:pt-28"
                        >
                          {children}
                        </main>
                        <Footer />
                      </div>
                    </Suspense>
                  </UserProvider>
                  </ActiveChainProvider>
              </LunoProvider>
              </EvmProvider>
            </ToastProvider>
            <Analytics />
          </PreloaderProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
