"use client";

import { ArrowRight } from "lucide-react";
import type { DefiNodeData, NodeDisplayConfig } from "../node-types";

type Props = {
  data: DefiNodeData;
  displayConfig: NodeDisplayConfig;
  mode: "swap" | "join_strategy";
};


function ProtocolIcon() {
  return (
    <img
      src="/chain-icon/hydration.png"
      alt="Hydration"
      className="w-4 h-4 rounded-full object-cover shrink-0"
    />
  );
}

function formatAmount(value?: string | number) {
  if (value === null || value === undefined || value === "") return "-";

  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

export function SwapLikeContent({ data, displayConfig, mode }: Props) {
  const {
    tokenInSymbol,
    tokenOutSymbol,
    amount,
    amountOut,
    slippage,
    apy,
  } = displayConfig;

  const rightLabel = mode === "swap" ? "Slippage" : "APY";
  const rightValue = mode === "swap" ? slippage : apy;

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-neutral-300">
        <div className="flex items-start justify-between gap-3 pr-6">
          <div>
            <p className="text-[22px] leading-none font-medium tracking-tight">
              {data?.action?.name || (mode === "swap" ? "Swap" : "Join strategy")}
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <ProtocolIcon />
              <span className="text-[11px] text-neutral-700">
                {data?.module?.name || "Hydration"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-neutral-500 leading-none">{rightLabel}</p>
            <p className="text-[18px] font-semibold leading-none mt-1">{rightValue}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 min-h-[110px] flex items-center">
        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Left */}
          <div className="flex flex-col items-start">
            <p className="text-[28px] leading-none font-medium">
              {formatAmount(amount)}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <ProtocolIcon />
              <span className="text-[13px] text-neutral-700">{tokenInSymbol || "-"}</span>
            </div>
          </div>

          {/* Center */}
          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-neutral-700" strokeWidth={2} />
          </div>

          {/* Right */}
          <div className="flex flex-col items-end">
            <p className="text-[28px] leading-none font-medium">
              {formatAmount(amountOut)}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <ProtocolIcon />
              <span className="text-[13px] text-neutral-700">{tokenOutSymbol || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}