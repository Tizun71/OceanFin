'use client';

import Image from 'next/image';
import { ArrowRight, Play, Repeat } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { resolveAssetIcon } from '@/lib/iconMap';
import type { StrategySimulate, Step } from '@/types/strategy.type';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  strategy: StrategySimulate | null;
  onExecute: () => void;
}

const fmt = (v?: number) =>
  typeof v === 'number' ? Number(v.toFixed(6)).toLocaleString() : '—';
const usd = (v?: number) =>
  typeof v === 'number' ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—';

function TokenPill({ symbol, amount }: { symbol?: string; amount?: number }) {
  if (!symbol) return null;
  const icon = resolveAssetIcon(symbol);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-border pl-1 pr-2.5 py-1">
      <span className="w-5 h-5 rounded-full overflow-hidden bg-black/40 border border-border flex items-center justify-center">
        {icon ? (
          <Image src={icon} alt={symbol} width={20} height={20} className="object-cover" />
        ) : (
          <span className="text-[7px] font-bold">{symbol.slice(0, 3)}</span>
        )}
      </span>
      <span className="text-xs font-medium text-foreground">
        {fmt(amount)} {symbol}
      </span>
    </span>
  );
}

const stepLabel = (s: Step) =>
  s.type === 'BORROW'
    ? `Borrow ${s.tokenOut?.symbol ?? ''}`
    : s.type === 'SWAP' || s.type === 'JOIN_STRATEGY'
      ? `Swap ${s.tokenIn?.symbol ?? ''} → ${s.tokenOut?.symbol ?? ''}`
      : s.type === 'SUPPLY'
        ? `Supply ${s.tokenIn?.symbol ?? ''}`
        : String(s.type).replace(/_/g, ' ');

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p data-numeric className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

export default function StrategyFlowDrawer({ open, onOpenChange, strategy, onExecute }: Props) {
  const steps = strategy?.steps ?? [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-background sm:max-w-md">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle className="text-lg">Simulation preview</DrawerTitle>
          <DrawerDescription>
            Estimated with live market prices. Review the flow, then execute to run it.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <Stat
              label="Initial"
              value={`${fmt(strategy?.initialCapital?.amount)} ${strategy?.initialCapital?.symbol ?? ''}`}
            />
            <Stat label="Loops" value={String(strategy?.loops ?? 0)} />
            <Stat label="Total supply" value={usd(strategy?.totalSupply)} />
            <Stat label="Total borrow" value={usd(strategy?.totalBorrow)} />
          </div>

          {/* Flow */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
              Execution flow
            </p>
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="relative pl-8">
                  {/* connector */}
                  {i < steps.length - 1 && (
                    <span className="absolute left-[11px] top-6 bottom-[-14px] w-px bg-border" />
                  )}
                  <span className="absolute left-0 top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-accent/15 border border-accent/30 text-[11px] font-semibold text-accent-light">
                    {i + 1}
                  </span>
                  <div className="rounded-lg bg-card border border-border p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">{stepLabel(s)}</span>
                      {s.type === 'BORROW' && (
                        <Repeat className="w-3.5 h-3.5 text-tertiary" aria-hidden />
                      )}
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      {s.tokenIn?.symbol && (
                        <TokenPill symbol={s.tokenIn.symbol} amount={s.tokenIn.amount} />
                      )}
                      {s.tokenIn?.symbol && s.tokenOut?.symbol && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" aria-hidden />
                      )}
                      {s.tokenOut?.symbol && (
                        <TokenPill symbol={s.tokenOut.symbol} amount={s.tokenOut.amount} />
                      )}
                    </div>
                    {s.agent && (
                      <p className="text-[11px] text-muted-foreground mt-2">{s.agent}</p>
                    )}
                  </div>
                </li>
              ))}
              {steps.length === 0 && (
                <p className="text-sm text-muted-foreground">No steps to simulate.</p>
              )}
            </ol>
          </div>
        </div>

        <DrawerFooter className="border-t border-border flex-row gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="flex-1"
            onClick={onExecute}
            disabled={steps.length === 0}
          >
            <Play size={14} fill="currentColor" className="mr-1.5" />
            Execute
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
