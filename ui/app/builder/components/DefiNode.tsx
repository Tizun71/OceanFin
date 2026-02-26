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
        bg-gradient-to-br from-[#18182a] to-[#0f0f1a]
        border border-[#2a2a3d]
        shadow-xl
        transition
        hover:border-indigo-500/60
        hover:shadow-indigo-500/20
        ${selected
          ? "ring-2 ring-indigo-500 shadow-indigo-500/30"
          : ""
        }
      `}
    >

      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-[#0f0f1a]"
      />

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-[#2a2a3d]">
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
          <div className="
            bg-[#141420]
            border border-[#2a2a3d]
            rounded-xl
            p-3
          ">
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
            border border-dashed border-neutral-700
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
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[#0f0f1a]"
      />
    </div>
  );
}