"use client";

import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";

export default function DefiNode({ data, selected }: any) {
  const tokenIn = data?.config?.tokenIn;
  const tokenOut = data?.config?.tokenOut;

  return (
    <div
      className={`
        relative
        w-[240px]
        rounded-2xl
        bg-gradient-to-br from-[#18182a] to-[#11111c]
        border border-[#2a2a3d]
        backdrop-blur-md
        shadow-lg
        transition-all duration-300
        hover:border-indigo-500/70
        hover:shadow-indigo-500/20
        ${selected ? "ring-2 ring-indigo-500 shadow-indigo-500/30" : ""}
      `}
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 hover:opacity-100 transition pointer-events-none" />

      {/* Top Handle */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-[#0f0f1a]"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3d]">
        <div>
          <p className="text-[11px] text-neutral-400 uppercase tracking-wide">
            {data.module?.name}
          </p>

          <p className="font-semibold text-sm text-white">
            {data.action?.name}
          </p>
        </div>

        {data.onDelete && (
          <button
            onClick={() => data.onDelete(data.id)}
            className="text-neutral-500 hover:text-red-500 transition"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 text-xs space-y-2">
        {/* Module ID */}
        <div className="flex justify-between text-neutral-400">
          <span>Module ID</span>
          <span className="text-neutral-300 font-mono">{data.module?.id}</span>
        </div>

        {/* Action ID */}
        <div className="flex justify-between text-neutral-400">
          <span>Action ID</span>
          <span className="text-neutral-300 font-mono">{data.action?.id}</span>
        </div>

        {/* Status */}
        <div className="pt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20">
            ● Active
          </span>

          {data.config && (
            <span className="text-[10px] text-indigo-400">Configured</span>
          )}
        </div>

        {/* TOKEN FLOW */}
        {tokenIn && tokenOut && (
          <div className="pt-2 border-t border-[#2a2a3d]">
            <div
              className="
              flex items-center justify-center gap-2
              text-sm font-semibold
              text-indigo-400
            "
            >
              <span className="text-emerald-400">{tokenIn}</span>

              <span className="text-neutral-500">→</span>

              <span className="text-pink-400">{tokenOut}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Handle */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[#0f0f1a]"
      />
    </div>
  );
}
