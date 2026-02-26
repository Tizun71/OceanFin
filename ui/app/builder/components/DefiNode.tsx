"use client";

import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";

export default function DefiNode({ data, selected }: any) {

  const tokenIn = data?.config?.tokenInSymbol;
  const tokenOut = data?.config?.tokenOutSymbol;

  const amountIn = data?.config?.amount;
  const amountOut = data?.config?.amountOut;

  const isConfigured =
    tokenIn && tokenOut && amountIn && amountOut;

  return (
    <div
      className={`
        relative
        w-[260px]
        rounded-2xl
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        shadow-[0_0_25px_rgba(0,0,0,0.35)]
        transition-all duration-300

        hover:border-indigo-400/50
        hover:shadow-indigo-500/20

        ${selected
          ? "ring-2 ring-indigo-400 shadow-indigo-500/30"
          : ""
        }
      `}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-400 !border-black"
      />

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex justify-between">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase">
              {data.module?.name}
            </p>
            <p className="text-sm font-semibold text-white">
              {data.action?.name}
            </p>
          </div>
          {data.onDelete && (
            <button
              onClick={() => data.onDelete(data.id)}
              className="
                text-neutral-500
                hover:text-red-500
                transition
              "
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="
            text-[10px]
            px-2 py-1
            bg-emerald-500/10
            text-emerald-400
            rounded-full
          ">
            ● Active
          </span>
          {isConfigured && (
            <span className="
              text-[10px]
              text-indigo-400
            ">
              Configured
            </span>
          )}
        </div>
        {/* TOKEN FLOW */}
        {isConfigured ? (
          <div
            className="
              bg-white/5
              border border-white/10
              backdrop-blur-md
              rounded-xl
              p-3
            "
          >
            {/* INPUT */}
            <div className="text-center">
              <p className="
                text-neutral-500
                text-[11px]
              ">
                You Pay
              </p>
              <p className="
                text-lg
                font-bold
                text-emerald-400
              ">
                {amountIn}
              </p>
              <p className="
                text-xs
                text-neutral-400
              ">
                {tokenIn}
              </p>
            </div>
            {/* ARROW */}
            <div className="
              text-center
              text-neutral-600
              text-lg
              my-1
            ">
              ↓
            </div>
            {/* OUTPUT */}
            <div className="text-center">
              <p className="
                text-neutral-500
                text-[11px]
              ">
                You Receive
              </p>
              <p className="
                text-lg
                font-bold
                text-pink-400
              ">
                {Number(amountOut).toFixed(6)}
              </p>
              <p className="
                text-xs
                text-neutral-400
              ">
                {tokenOut}
              </p>
            </div>
          </div>
        ) : (
          <div className="
            text-center
            text-xs
            text-neutral-600
            border border-dashed border-white/10
            bg-white/5
            backdrop-blur-md
            rounded-xl
            py-3
          ">
            Not Configured
          </div>
        )}
      </div>
      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-400 !border-black"
      />
    </div>
  );
}