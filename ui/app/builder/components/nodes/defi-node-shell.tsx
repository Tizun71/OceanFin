"use client";

import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";
import ProtocolIcon from "./protocol-icon";
import type { DefiOperationType } from "./defi-node.types";

type DefiNodeShellProps = {
  nodeId: string;
  selected?: boolean;
  title: string;
  protocolName?: string;
  operationType?: DefiOperationType;
  rightLabel?: React.ReactNode;
  onDelete?: (id: string) => void;
  children: React.ReactNode;
};

// Per-operation accent so a workflow reads at a glance: cool tones for
// asset moves (swap/join), warm for debt (borrow), green for yield (supply).
// Full class strings keep Tailwind's JIT from purging them.
const ACCENTS: Record<
  string,
  { label: string; badge: string; glow: string; ring: string; dot: string }
> = {
  SWAP: {
    label: "Swap",
    badge: "bg-cyan-400/12 text-cyan-200 border-cyan-300/25",
    glow: "bg-cyan-400/20",
    ring: "ring-cyan-400/70 border-cyan-300/60",
    dot: "!bg-cyan-400",
  },
  SUPPLY: {
    label: "Supply",
    badge: "bg-emerald-400/12 text-emerald-200 border-emerald-300/25",
    glow: "bg-emerald-400/20",
    ring: "ring-emerald-400/70 border-emerald-300/60",
    dot: "!bg-emerald-400",
  },
  BORROW: {
    label: "Borrow",
    badge: "bg-amber-400/12 text-amber-200 border-amber-300/25",
    glow: "bg-amber-400/20",
    ring: "ring-amber-400/70 border-amber-300/60",
    dot: "!bg-amber-400",
  },
  JOIN_STRATEGY: {
    label: "Join",
    badge: "bg-violet-400/12 text-violet-200 border-violet-300/25",
    glow: "bg-violet-400/20",
    ring: "ring-violet-400/70 border-violet-300/60",
    dot: "!bg-violet-400",
  },
  DEFAULT: {
    label: "Step",
    badge: "bg-white/8 text-white/55 border-white/15",
    glow: "bg-white/10",
    ring: "ring-cyan-400/70 border-cyan-300/60",
    dot: "!bg-white/50",
  },
};

export default function DefiNodeShell({
  nodeId,
  selected,
  title,
  protocolName = "Hydration",
  operationType,
  rightLabel,
  onDelete,
  children,
}: DefiNodeShellProps) {
  const accent = ACCENTS[operationType ?? "DEFAULT"] ?? ACCENTS.DEFAULT;

  return (
    <div
      className={`
        group relative w-[360px] min-h-[210px] rounded-[22px]
        border border-white/20
        bg-gradient-to-b from-white/[0.07] to-white/[0.02]
        backdrop-blur-xl
        shadow-[0_10px_40px_rgba(0,0,0,0.35)]
        text-white overflow-hidden
        transition-all duration-300
        hover:-translate-y-0.5 hover:border-white/35
        hover:shadow-[0_16px_50px_rgba(0,0,0,0.45)]
        ${selected ? `ring-2 ${accent.ring}` : ""}
      `}
    >
      {/* Tinted corner glow — the only splash of the operation colour, kept
          soft so several nodes on one canvas don't fight for attention. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90 ${accent.glow}`}
      />

      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className={`!w-4 !h-4 !border-2 !border-white/70 ${accent.dot}`}
      />

      {/* Delete */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(nodeId);
          }}
          aria-label="Delete step"
          className="absolute top-4 right-4 z-20 rounded-md p-1 text-white/50 opacity-0 transition-all duration-200 hover:bg-white/10 hover:text-red-400 group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      )}

      {/* Header */}
      <div className="relative px-5 pt-4 pb-3">
        <div className="flex items-start justify-between pr-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[19px] font-bold leading-none tracking-tight text-white">
                {title}
              </h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accent.badge}`}
              >
                {accent.label}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <ProtocolIcon name={protocolName} />
              <span className="text-[13px] text-white/80 leading-none">
                {protocolName}
              </span>
            </div>
          </div>

          {rightLabel ? <div className="text-right">{rightLabel}</div> : <div />}
        </div>

        <div className="mt-4 h-px bg-gradient-to-r from-white/30 via-white/15 to-transparent" />
      </div>

      {/* Body */}
      <div className="relative px-5 pb-4">{children}</div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className={`!w-4 !h-4 !border-2 !border-white/70 ${accent.dot}`}
      />
    </div>
  );
}
