import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { Sidebar } from "@/components/shared/sidebar"
import { Providers } from "@/providers/luno-provider"
import { WalletButton } from "@/components/shared/wallet-button"

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
      <body className={`font-sans ${spaceGrotesk.variable}`}>
          <Providers>
            <Suspense fallback={<div>Loading...</div>}>
              <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 h-screen w-20 border-r bg-card z-40">
                  <Sidebar />
                </aside>
                {/* Main */}
                <main className="flex-1 ml-20 overflow-y-auto min-h-screen">
                  <div className="relative z-50 flex justify-end">
                    <WalletButton />
                  </div>
                  {children}
                </main>
              </div>
            </Suspense>
          </Providers>
          <Analytics />
        
      </body>
    </html>
  )
}
