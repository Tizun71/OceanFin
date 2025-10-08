import { Badge } from "@/components/ui/badge"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StrategyHeaderProps {
  strategy: {
    title: string
    status: "Active" | "Inactive"
    apy: number
    strategist: string
    handle: string
    date: string
  }
}

export function StrategyHeader({ strategy }: StrategyHeaderProps) {
  return (
    <div className="glass rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#0f1419]">{strategy.title}</h1>
            <Badge
              variant={strategy.status === "Active" ? "default" : "secondary"}
              className="bg-success/20 text-success"
            >
              {strategy.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Strategy by</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary font-bold">P</span>
                </div>
                <span className="font-semibold text-[#0f1419]">{strategy.strategist}</span>
                <span>{strategy.handle}</span>
              </div>
            </div>
            <span>{strategy.date}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">APY</span>
          <span className="text-3xl font-bold text-[#10b981]">{strategy.apy.toFixed(2)}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-primary/20" />
          <span className="text-muted-foreground">
            POLKADOT is not holding custody over users' assets. Users' funds are under their control.
          </span>
        </div>
      </div>
    </div>
  )
}
