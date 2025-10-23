import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import LunoProvider from "@/providers/luno-provider"
import { LunoProviderWrapper } from "./contexts/luno-context"
import Footer from "@/components/shared/footer"
import { HeroSection } from "@/components/hero-section"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Polkadot DeFi Strategies",
  description: "AI-powered yield strategies across the Polkadot ecosystem",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">

      <body className={`h-screen font-sans ${spaceGrotesk.variable} bg-gradient-to-br from-foreground/40 via-accent/5 to-foreground/80 relative overflow-hidden`}>
        <LunoProvider>
          <LunoProviderWrapper>
            <Suspense fallback={<div>Loading...</div>}>
              <div className="h-screen flex flex-col relative z-0">
                <HeroSection />
                {/* Main */}
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
                <Footer />
                </div>
            </Suspense>
          </LunoProviderWrapper>
        </LunoProvider>
        <Analytics />
      </body>
    </html>
  )
}
