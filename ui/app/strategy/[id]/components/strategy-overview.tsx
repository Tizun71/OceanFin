import { SimulateResult } from "@/app/types/simulate"
import StrategyFlow from "./strategy-flow"


interface StrategyOverviewProps {
  strategy: SimulateResult
}

export function StrategyOverview({ strategy }: StrategyOverviewProps) {
  const steps = strategy?.steps || []

  return (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
          Strategy Simulation
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          Loops: {strategy.loops} | Fee: {strategy.fee} | Supply: {strategy.totalSupply} | Borrow:{" "}
          {strategy.totalBorrow}
        </p>
      </div>

      <StrategyFlow steps={steps} />
    </div>
  )
}
