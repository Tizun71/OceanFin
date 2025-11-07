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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Polkadot DeFi Strategies",
  description: "AI-powered yield strategies across the Polkadot ecosystem",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen font-sans ${spaceGrotesk.variable} relative overflow-x-hidden`}
      >
        {/* Background Video */}
        <BackgroundVideo />

        {/* Video fade-out gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1] pointer-events-none" />

        <LunoProvider>
          <LunoProviderWrapper>
            <ToastProvider>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen text-gray-400 text-lg">
                  Loading...
                </div>}
              >
                {/* Dark overlay */}
                <div className="fixed inset-0 bg-black/65 z-[2]" />
                
                <div className="min-h-screen flex flex-col relative z-10">
                  <HeroSection /> 
                    <main className="flex-1 pt-[30px]"> 
                      {children}
                    </main>
                  <Footer />
                </div>
              </Suspense>
            </ToastProvider>
          </LunoProviderWrapper>
        </LunoProvider>
        <Analytics />
      </body>
    </html>
  );
}
