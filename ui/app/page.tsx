import { HeroSection } from "@/components/hero-section"
import { StrategyList } from "./strategy/[id]/components/strategy-list"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 web3-grid polkadot-dots relative">
        <HeroSection />
        <StrategyList />
      </main>
    </div>
  )
}
