import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import LunoProvider from "@/providers/luno-provider";
import { LunoProviderWrapper } from "./contexts/luno-context";
import Footer from "@/components/shared/footer";
import { HeroSection } from "@/components/hero-section";
import { BackgroundVideo } from "@/components/background-video";
import { ToastProvider } from "@/providers/toast-provider";
import { QueryProvider } from "@/providers/query-client-provider";

import { Montserrat } from 'next/font/google';
import { PreloaderProvider } from "@/providers/preloader-provider";
import { Preloader } from "@/components/preloader";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-montserrat',
});


const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
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
      <body
        className={`min-h-screen font-sans ${montserrat.variable} relative overflow-x-hidden`}
        style={{ fontFamily: "monospace" }}
      >
        <QueryProvider>
          <PreloaderProvider>
            <Preloader/>
            <BackgroundVideo />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1] pointer-events-none" />
            <ToastProvider>
              <LunoProvider>
                <LunoProviderWrapper>
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen text-gray-400 text-lg">
                      Loading...
                    </div>}
                  >
                    <div className="fixed inset-0 bg-black/65 z-[2]" />
                    <div className="min-h-screen flex flex-col relative z-10">
                      <HeroSection />
                      <main className="flex-1 pt-[30px]">
                        {children}
                      </main>
                      <Footer />
                    </div>
                  </Suspense>
                </LunoProviderWrapper>
              </LunoProvider>
            </ToastProvider>
            <Analytics />
          </PreloaderProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
