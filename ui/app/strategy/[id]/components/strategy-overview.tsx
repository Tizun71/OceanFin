import { StrategyFlow } from "./strategy-flow"

interface StrategyOverviewProps {
  strategy: {
    description: string
    agents: string[]
    steps: any[]
  }
}

export function StrategyOverview({ strategy }: StrategyOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
          Description
        </h3>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-sm font-semibold">Executed by Agents:</span>
          <div className="flex gap-2">
            {strategy.agents.map((agent) => (
              <div key={agent} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm">
                <div className="w-4 h-4 rounded-full bg-primary/20" />
                <span>{agent}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">{strategy.description}</p>
      </div>

      <StrategyFlow steps={strategy.steps} />
    </div>
  )
}
