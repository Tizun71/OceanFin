import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Strategy {
  id: string;
  title: string;
  tags: string[];
  apy: number;
  strategist: string;
  handle: string;
  date: string;
  assets: string[];
  agents: string[];
  chains: string[];
  status: "Active" | "Inactive";
}

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  return (
    <Link href={`/strategy/${strategy.id}`}>
      <Card className="group relative overflow-hidden p-6 cursor-pointer rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary/60 glass border border-transparent">
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Tags */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {strategy.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-primary/10 text-primary text-xs border border-primary/20"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-4 text-[#0f1419] group-hover:text-primary transition-all">
            {strategy.title}
          </h3>

          {/* Strategist & APY */}
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Strategist</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-xs text-white font-bold">P</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f1419]">{strategy.strategist}</p>
                  <p className="text-xs text-muted-foreground">{strategy.handle}</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">APY</p>
              <p className="text-2xl font-bold text-[#10b981]">{strategy.apy.toFixed(2)}%</p>
            </div>
          </div>

          {/* Assets / Agents / Chains */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/20 mb-12">
            {/* Asset */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Asset</p>
              <div className="flex gap-1">
                {strategy.assets.slice(0, 2).map((asset) => (
                  <div
                    key={asset}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center"
                    title={asset}
                  >
                    <span className="text-[10px] font-bold text-primary">{asset.slice(0, 1)}</span>
                  </div>
                ))}
                {strategy.assets.length > 2 && (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-[10px] font-bold">+{strategy.assets.length - 2}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Agent */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Agent</p>
              <div className="flex gap-1">
                {strategy.agents.slice(0, 2).map((agent) => (
                  <div
                    key={agent}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border border-secondary/30 flex items-center justify-center"
                    title={agent}
                  >
                    <span className="text-[10px] font-bold text-secondary">{agent.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chain */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Chain</p>
              <div className="flex gap-1">
                {strategy.chains.slice(0, 2).map((chain) => (
                  <div
                    key={chain}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-accent/30 flex items-center justify-center"
                    title={chain}
                  >
                    <span className="text-[10px] font-bold text-accent">{chain.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="absolute bottom-3 right-3 z-20"
            onClick={(e) => {
              e.stopPropagation(); 
              alert(`Simulate strategy: ${strategy.title}`);
            }}
          >
            Simulate
          </Button>
        </div>
      </Card>
    </Link>
  );
}
