"use client";

import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";
import ProtocolIcon from "./protocol-icon";

type DefiNodeShellProps = {
  nodeId: string;
  selected?: boolean;
  title: string;
  protocolName?: string;
  rightLabel?: React.ReactNode;
  onDelete?: (id: string) => void;
  children: React.ReactNode;
};

export default function DefiNodeShell({
  nodeId,
  selected,
  title,
  protocolName = "Hydration",
  rightLabel,
  onDelete,
  children,
}: DefiNodeShellProps) {
  return (
    <div
      className={`
        relative w-[360px] min-h-[210px] rounded-[22px]
        border border-white/35
        bg-[var(--background)]/35
        backdrop-blur-xl
        shadow-[0_10px_40px_rgba(0,0,0,0.35)]
        text-white
        overflow-hidden
        transition-all duration-300
        ${selected ? "ring-2 ring-cyan-400/80 border-cyan-300/70" : ""}
      `}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!w-4 !h-4 !bg-cyan-400 !border-2 !border-white/70"
      />

      {/* Delete */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(nodeId);
          }}
          className="absolute top-4 right-4 z-20 text-white/60 hover:text-red-400 transition"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between pr-8">
          <div>
            <h3 className="text-[18px] md:text-[20px] font-bold leading-none tracking-tight text-white">
              {title}
            </h3>

            <div className="mt-3 flex items-center gap-2">
              <ProtocolIcon />
              <span className="text-[14px] text-white/85 leading-none">
                {protocolName}
              </span>
            </div>
          </div>

          {rightLabel ? <div className="text-right">{rightLabel}</div> : <div />}
        </div>

        {/* Divider line like mockup */}
        <div className="mt-4 h-px bg-white/35" />
      </div>

      {/* Body */}
      <div className="px-5 pb-4">{children}</div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="!w-4 !h-4 !bg-cyan-400 !border-2 !border-white/70"
      />
    </div>
  );
}