import { Bot } from "lucide-react";
import { StrategyHeader } from "./strategy-header";

interface StrategyOverviewProps {
  strategy?: {
    description?: string;
    agents?: string[];
    steps?: any[];
  };
  simulateData?: {
    initialCapital?: any;
    loops?: number;
    fee?: number;
    totalSupply?: number;
    totalBorrow?: number;
    steps?: any[];
  };
}

export function StrategyOverview({ strategy, simulateData }: StrategyOverviewProps) {
  const safeSteps =
    simulateData?.steps || strategy?.steps || [];

  const safeAgents =
    simulateData?.steps?.map((s) => s.agent).filter(Boolean) ||
    strategy?.agents ||
    [];

  const safeDescription =
    strategy?.description ||
    `Strategy simulation with ${simulateData?.loops || 0} loops, starting from ${simulateData?.initialCapital?.symbol || "N/A"}.`;

  return (
    <div className="space-y-6">
    
      {/* === STRATEGY HEADER === */}
      <StrategyHeader strategy={strategy as any} simulateData={simulateData} />

      {/* === DESCRIPTION SECTION === */}
      <div className="glass rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-1 w-1 rounded-full bg-accent"></div>
          <h3 className="text-xl font-semibold text-foreground">
            Strategy Description
          </h3>
        </div>

        {/* Description text */}
        <p className="text-foreground/80 leading-relaxed text-[15px]">
          {safeDescription}
        </p>

        {/* Agents */}
        {safeAgents.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground/90">
                Executed by Agents
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {safeAgents.map((agent, idx) => (
                <div
                  key={`${agent}-${idx}`}
                  className="
                    group px-4 py-2 rounded-lg 
                    bg-card/60 border border-border/50
                    hover:border-accent/50 hover:bg-accent/10
                    transition-all duration-300
                    backdrop-blur-sm
                  "
                >
                  <span className="text-sm text-foreground/90 group-hover:text-accent-light transition-colors">
                    {agent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
