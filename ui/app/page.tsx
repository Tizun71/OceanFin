import { StrategyList } from "@/components/strategy-list"
import { HeroSection } from "@/components/hero-section"
import { Sidebar } from "@/components/sidebar"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 web3-grid polkadot-dots relative">
        <HeroSection />
        <StrategyList />
      </main>
    </div>
  )
}
