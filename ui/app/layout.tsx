import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import LunoProvider from "@/providers/luno-provider";
import { LunoProviderWrapper } from "./contexts/luno-context";
import Footer from "@/components/layout/footer";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`h-full font-sans ${spaceGrotesk.variable} bg-background relative`}
      >
        <LunoProvider>
          <LunoProviderWrapper>
            <div className="flex min-h-screen relative z-0">
              {/* Sidebar */}
              <aside className="fixed left-0 top-0 h-screen w-20 border-r bg-card z-40">
                <Sidebar />
              </aside>

              {/* Main */}
              <div className="flex flex-col min-h-screen flex-1 ml-20 ">
                <Suspense
                  fallback={
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  }
                >
                  <main className="flex-1 overflow-y-auto z-10">{children}</main>
                </Suspense>

                {/* Footer */}
                <Footer />
              </div>
            </div>
          </LunoProviderWrapper>
        </LunoProvider>
        <Analytics />
      </body>
    </html>
  );
}
