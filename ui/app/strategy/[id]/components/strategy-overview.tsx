import { StrategyFlow } from "./strategy-flow";

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
      {/* === DESCRIPTION SECTION === */}
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
          Description
        </h3>

        {/* Agents */}
        {safeAgents.length > 0 && (
          <div className="flex items-start gap-3 mb-4">
            <span className="text-sm font-semibold">Executed by Agents:</span>
            <div className="flex flex-wrap gap-2">
              {safeAgents.map((agent, idx) => (
                <div
                  key={`${agent}-${idx}`}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                >
                  <div className="w-4 h-4 rounded-full bg-primary/20" />
                  <span>{agent}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description text */}
        <p className="text-muted-foreground leading-relaxed">{safeDescription}</p>
      </div>

      {/* === STRATEGY FLOW SECTION === */}
      {safeSteps.length > 0 ? (
        <StrategyFlow
          steps={safeSteps}
          initialCapital={simulateData?.initialCapital}
          loops={simulateData?.loops}
          fee={simulateData?.fee}
          totalSupply={simulateData?.totalSupply}
          totalBorrow={simulateData?.totalBorrow}
        />
      ) : (
        <div className="glass rounded-lg p-6 text-sm text-muted-foreground">
          No flow steps available yet.
        </div>
      )}
    </div>
  );
}
