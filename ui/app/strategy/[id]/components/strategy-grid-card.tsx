'use client';

import { ArrowRight, Layers, Play, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resolveAssetIcon, resolveChainIcon } from '@/lib/iconMap';

interface Props {
  strategy: any;
  onSimulate: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Pull the active workflow version (falls back to first) and its steps. */
function getSteps(strategy: any): any[] {
  const versions = strategy.defi_strategy_versions ?? [];
  const active =
    versions.find((v: any) => v.id === strategy.current_version_id) ?? versions[0];
  return active?.workflow_json?.steps ?? [];
}

/** Ordered, de-duplicated token symbols the funds flow through. */
function getTokenFlow(steps: any[]): string[] {
  const seq = [
    ...steps.map((s) => s?.tokenIn?.symbol).filter(Boolean),
    steps.at(-1)?.tokenOut?.symbol,
  ].filter(Boolean) as string[];
  return seq.filter((sym, i) => sym !== seq[i - 1]);
}

function TokenIcon({ symbol, size = 22 }: { symbol: string; size?: number }) {
  const icon = resolveAssetIcon(symbol);
  return (
    <div
      className="rounded-full overflow-hidden border border-border bg-black/40 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
      title={symbol}
    >
      {icon ? (
        <Image src={icon} alt={symbol} width={size} height={size} className="object-cover" />
      ) : (
        <span className="text-[7px] font-bold text-foreground">{symbol.slice(0, 3)}</span>
      )}
    </div>
  );
}

export default function StrategyGridCard({ strategy, onSimulate, onDelete }: Props) {
  const steps = getSteps(strategy);
  const flow = getTokenFlow(steps);
  const chain = strategy.chain_context || strategy.context || 'Unknown';
  const chainIcon = resolveChainIcon(chain);

  return (
    <Card className="group flex flex-col p-4 gap-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3
            className="text-lg font-semibold text-foreground truncate tracking-tight"
            title={strategy.name}
          >
            {strategy.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {chainIcon && (
              <Image src={chainIcon} alt={chain} width={16} height={16} className="rounded-full" />
            )}
            <span className="font-medium text-foreground/90">{chain}</span>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="bg-accent/15 text-accent-light border border-accent/30 rounded-md px-2 py-0.5 flex items-center gap-1 shrink-0"
        >
          <Layers className="w-3 h-3" /> {steps.length}
        </Badge>
      </header>

      {/* Asset path */}
      <div className="relative z-10 flex-1 pt-3 border-t border-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Asset path
        </p>
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-2">
          {flow.length > 0 ? (
            flow.map((symbol, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 bg-surface-2 pl-0.5 pr-2 py-0.5 rounded-full border border-border">
                  <TokenIcon symbol={symbol} />
                  <span className="text-xs font-medium text-foreground">{symbol}</span>
                </div>
                {i < flow.length - 1 && <ArrowRight size={13} className="text-accent-light/60" />}
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">No steps configured</span>
          )}
        </div>

        {steps.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {steps.map((s: any, i: number) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/25 text-foreground/80 capitalize"
              >
                {String(s.type).toLowerCase().replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <footer className="relative z-10 flex items-center gap-2 mt-4 pt-3 border-t border-border">
        <button
          onClick={() => onSimulate(strategy.id)}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 active:scale-[0.98] transition-all"
        >
          <Play size={14} fill="currentColor" />
          Simulate
        </button>
        <button
          onClick={() => onDelete(strategy.id)}
          aria-label="Delete strategy"
          className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface-2 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground border border-border transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </footer>
    </Card>
  );
}
