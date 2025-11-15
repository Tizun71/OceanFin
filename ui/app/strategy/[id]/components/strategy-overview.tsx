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
    `Strategy simulation with ${simulateData?.loops || 0} loops, starting from ${simulateData?.initialCapital?.symbol || "DOT"}.`;

  const AGENT_ICONS: Record<string, string> = {
    HYDRATION:
      "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  };
  const uniqueAgents = Array.from(new Set(safeAgents));

  return (
    <div className="space-y-6">

      {/* === STRATEGY HEADER === */}
      <StrategyHeader strategy={strategy as any} simulateData={simulateData} />

      {/* === DESCRIPTION SECTION === */}
      <div className="glass rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-3 ">
          <div className="h-1 w-1 rounded-full bg-accent"></div>
          <h3 className="text-xl font-semibold text-foreground">
            Strategy Description
          </h3>
        </div>

        {simulateData ? (
          <p className="text-foreground/80 leading-relaxed text-[15px]">
            {safeDescription}
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center px-4">
            <div className="w-10 h-10 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <Bot className="w-10 h-10 text-accent/50" />
            </div>
            <p className="text-muted-foreground text-center max-w-md text-sm">
              Please run a simulation first to see the strategy details and expected results.
            </p>
          </div>
        )}

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
              {uniqueAgents.map((agent, idx) => {
                const iconUrl = AGENT_ICONS[agent] || null;
                return (
                  <div
                    key={`${agent}-${idx}`}
                    className="
                      group px-4 py-2 rounded-lg 
                      bg-card/60 border border-border/50
                      hover:border-accent/50 hover:bg-accent/10
                      transition-all duration-300
                      backdrop-blur-sm flex items-center justify-center
                    "
                  >
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={agent}
                        className="w-8 h-8 rounded-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-accent" />
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
