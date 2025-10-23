import { HeroSection } from "@/components/hero-section"
import { StrategyList } from "./strategy/[id]/components/strategy-list"
import { FeaturedStrategies } from "./strategy/[id]/components/strategy-featured"
import Footer from "@/components/shared/footer"

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-110px)] mt-20">
      <main className="flex-1 relative mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          <div className="hidden xl:block">
            <FeaturedStrategies />
          </div>
          <div>
            <StrategyList />
          </div>
        </div>
      </main>
    </div>
  )
}
