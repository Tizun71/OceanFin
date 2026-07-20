import { Bot } from "lucide-react";

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
      {/* StrategyHeader moved up to the page level — it rendered here, so the
          title and APY vanished the moment you opened any other tab. */}

      {/* === DESCRIPTION SECTION === */}
      <section className="glass rounded-xl p-6 space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Description
        </h2>

        {simulateData ? (
          // ~70ch keeps prose in the comfortable reading band instead of
          // running the full panel width.
          <p className="text-foreground/90 leading-relaxed max-w-[70ch]">
            {safeDescription}
          </p>
        ) : (
          <SimulationEmptyState />
        )}

        {/* Agents */}
        {safeAgents.length > 0 && (
          <div className="pt-5 border-t border-border">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Executed by
            </h3>
            <ul className="flex flex-wrap gap-2">
              {uniqueAgents.map((agent, idx) => {
                const iconUrl = AGENT_ICONS[String(agent)] || null;
                return (
                  // The chips were icon-only with the agent name hidden in an
                  // alt attribute, so sighted users had to recognise protocols
                  // by logo alone. The name is now visible text.
                  <li
                    key={`${agent}-${idx}`}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2"
                  >
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        aria-hidden
                        className="w-5 h-5 rounded-full object-contain"
                      />
                    ) : (
                      <span className="grid size-5 place-items-center rounded-full bg-accent/15">
                        <Bot className="w-3 h-3 text-accent" aria-hidden />
                      </span>
                    )}
                    <span className="text-sm font-medium text-foreground/90">
                      {String(agent)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Shared "run a simulation first" state.
 *
 * This exact block was duplicated in three places (Overview, the Flow tab, and
 * inline here) with a `w-10 h-10` circle wrapping a `w-10 h-10` icon — the
 * icon completely filled and overflowed its own container.
 */
export function SimulationEmptyState({
  message = "Run a simulation to see the projected steps and returns for this strategy.",
}: {
  message?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-accent/10">
        <Bot className="w-6 h-6 text-accent" aria-hidden />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
