import { StrategyList } from "./strategy/[id]/components/strategy-list"
import { FeaturedStrategies } from "./strategy/[id]/components/strategy-featured"

export default function Home() {
  return (
    <div className="flex h-auto min-h-[calc(100vh-110px)] mt-15 overflow-y-auto">
      <main className="flex-1 relative mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="flex justify-center items-center">
            <div className="translate-x-[-40px]">
              <FeaturedStrategies />
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="translate-x-[-60px]">
              <StrategyList />
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
