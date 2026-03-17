"use client";

import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";
import { DefiNodeProps } from "./nodes/node-types";
import { getNodeVariant } from "./nodes/node-utils/getNodeVariant";
import { buildNodeDisplayConfig } from "./nodes/node-utils/buildNodeDisplayConfig";
import { SwapLikeContent } from "./nodes/node-views/SwapLikeContent";
import { SupplyContent } from "./nodes/node-views/SupplyContent";
import { BorrowContent } from "./nodes/node-views/BorrowContent";

export default function DefiNode({ data, selected }: DefiNodeProps) {
  const variant = getNodeVariant(data?.action);
  const displayConfig = buildNodeDisplayConfig(data);

  return (
    <div
      className={`
        relative
        w-[300px]
        rounded-md
        border
        bg-white/90
        text-black
        shadow-sm
        transition-all
        duration-200
        ${selected ? "border-black ring-1 ring-black" : "border-neutral-400"}
      `}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!w-3 !h-3 !bg-black !border-white"
      />

      {/* Delete */}
      {data?.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(data?.id);
          }}
          className="absolute top-2 right-2 z-10 text-neutral-500 hover:text-red-500 transition"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Variant render */}
      {variant === "swap" && (
        <SwapLikeContent
          data={data}
          displayConfig={displayConfig}
          mode="swap"
        />
      )}

      {variant === "join_strategy" && (
        <SwapLikeContent
          data={data}
          displayConfig={displayConfig}
          mode="join_strategy"
        />
      )}

      {variant === "supply" && (
        <SupplyContent
          data={data}
          displayConfig={displayConfig}
        />
      )}

      {variant === "borrow" && (
        <BorrowContent
          data={data}
          displayConfig={displayConfig}
        />
      )}

      {/* fallback */}
      {variant === "default" && (
        <SwapLikeContent
          data={data}
          displayConfig={displayConfig}
          mode="swap"
        />
      )}

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="!w-3 !h-3 !bg-black !border-white"
      />
    </div>
  );
}