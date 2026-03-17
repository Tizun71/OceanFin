"use client";

import type { DefiNodeData, NodeDisplayConfig } from "../node-types";

type Props = {
  data: DefiNodeData;
  displayConfig: NodeDisplayConfig;
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

export function SupplyContent({ data, displayConfig }: Props) {
  const {
    amount,
    tokenInSymbol,
    apy,
  } = displayConfig;

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-neutral-300">
        <div className="flex items-start justify-between gap-3 pr-6">
          <div>
            <p className="text-[22px] leading-none font-medium tracking-tight">
              {data?.action?.name || "Supply"}
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <ProtocolIcon />
              <span className="text-[11px] text-neutral-700">
                {data?.module?.name || "Hydration"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-neutral-500 leading-none">APY</p>
            <p className="text-[18px] font-semibold leading-none mt-1">{apy}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-6 min-h-[110px] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <p className="text-[28px] leading-none font-medium">
            {formatAmount(amount)}
          </p>

          <div className="flex items-center gap-2">
            <ProtocolIcon />
            <span className="text-[13px] text-neutral-700">{tokenInSymbol || "-"}</span>
          </div>
        </div>
      </div>
    </>
  );
}