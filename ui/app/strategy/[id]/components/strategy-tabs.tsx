import { SimulateResult } from "@/app/types/simulate"
import { StrategyOverview } from "./strategy-overview"

interface StrategyTabsProps {
  strategy: SimulateResult
}

export function StrategyTabs({ strategy }: StrategyTabsProps) {
  if (!strategy) return <div>No strategy data</div>

  return (
    <div className="mt-6">
      <StrategyOverview strategy={strategy} />
    </div>
  )
}
