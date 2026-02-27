"use client";

import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";

export default function DefiNode({ data, selected }: any) {
  const config = data?.config ?? {};
  const operationType = config.operation_type;

  let isConfigured = false;

  isConfigured =
  !!config &&
  typeof config.amount === "number" &&
  !!config.tokenInId &&
  !!config.tokenOutId &&
  config.amountOut !== undefined;

  return (
    <div
      className={`
        relative
        w-[260px]
        rounded-xl
        bg-[#1a1a1a]
        border border-neutral-700
        shadow-lg
        transition-all
        ${selected ? "ring-2 ring-indigo-500" : ""}
      `}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!w-3 !h-3 !bg-indigo-500 !border-black"
      />

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-neutral-700 flex justify-between items-start">
        <div>
          <p className="text-xs text-neutral-400">
            {data.module?.name}
          </p>
          <p className="text-sm font-semibold text-white">
            {data.action?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Right corner dynamic info */}
          {operationType === "SWAP" && isConfigured && (
            <p className="text-xs text-white">
              Slippage {config.slippage ?? 0}%
            </p>
          )}

          {operationType === "SUPPLY" && isConfigured && (
            <p className="text-xs text-white">
              APY {config.supply_apy ?? 0}%
            </p>
          )}

          {operationType === "BORROW" && isConfigured && (
            <p className="text-xs text-white">
              APY {config.borrow_apy ?? 0}%
            </p>
          )}

          {data.onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(data.id);
              }}
              className="text-neutral-500 hover:text-red-500 transition"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="px-4 py-4 min-h-[120px] flex items-center justify-center">
        {!isConfigured && (
          <div className="text-xs text-neutral-500 text-center border border-dashed border-neutral-600 rounded-lg px-4 py-3">
            Not Configured
          </div>
        )}

        {/* SWAP */}
        {operationType === "SWAP" && isConfigured && (
          <div className="w-full flex items-center justify-between">
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {config.amount}
              </p>
              <p className="text-xs text-neutral-400">
                {config.tokenInSymbol}
              </p>
            </div>

            <span className="text-white text-xl">→</span>

            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {Number(config.amountOut).toFixed(6)}
              </p>
              <p className="text-xs text-neutral-400">
                {config.tokenOutSymbol}
              </p>
            </div>
          </div>
        )}

        {/* SUPPLY */}
        {operationType === "SUPPLY" && isConfigured && (
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {config.amount}
            </p>
            <p className="text-xs text-neutral-400">
              {config.tokenInSymbol}
            </p>
          </div>
        )}

        {/* BORROW */}
        {operationType === "BORROW" && isConfigured && (
          <div className="w-full text-center space-y-3">
            <div>
              <p className="text-lg font-bold text-white">
                {Number(config.amountOut).toFixed(6)}
              </p>
              <p className="text-xs text-neutral-400">
                {config.tokenOutSymbol}
              </p>
            </div>

            <div className="flex justify-between text-xs text-neutral-500 border-t border-neutral-700 pt-2">
              <span>Collateral {config.tokenInSymbol}</span>
              <span>LTV {config.ltv ?? 80}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="!w-3 !h-3 !bg-emerald-500 !border-black"
      />
    </div>
  );
}