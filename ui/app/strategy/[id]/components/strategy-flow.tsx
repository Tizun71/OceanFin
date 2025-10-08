"use client";

import { ArrowDown, Workflow } from "lucide-react";

interface TokenInfo {
  assetId?: string | number;
  symbol?: string;
  amount?: string | number | null;
}

interface FlowStep {
  step: number;
  type: string;
  agent: string;
  tokenIn?: TokenInfo | null;
  tokenOut?: TokenInfo | null;
}

interface StrategyFlowProps {
  steps?: FlowStep[];
  initialCapital?: TokenInfo;
  loops?: number;
  fee?: number;
  totalSupply?: number;
  totalBorrow?: number;
}

export function StrategyFlow({
  steps = [],
  initialCapital,
  loops,
  fee,
  totalSupply,
  totalBorrow,
}: StrategyFlowProps) {
  const validSteps = Array.isArray(steps) ? steps : [];

  if (!validSteps.length) {
    return (
      <div className="glass rounded-lg p-6 text-center text-muted-foreground">
        No flow data available. Please run a simulation first.
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-primary/20 p-6">
      {/* === HEADER === */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent flex items-center gap-2">
          <Workflow className="w-5 h-5 text-[#00D1FF]" />
          Strategy Flow
        </h3>
        <span className="text-sm text-muted-foreground">
          Total Steps:{" "}
          <span className="text-[#00D1FF] font-semibold">{validSteps.length}</span>
        </span>
      </div>

      {/* === MAIN LAYOUT === */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* === LEFT: FLOW STEPS === */}
        <div className="flex-1 flex flex-col space-y-4">
          {validSteps.map((step, idx) => {
            const hasIn = !!step.tokenIn;
            const hasOut = !!step.tokenOut;

            return (
              <div
                key={idx}
                className="glass rounded-lg border border-primary/20 p-4 hover:border-[#00D1FF]/40 transition-all duration-200"
              >
                {/* STEP HEADER */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{step.step}</span>
                    </div>
                    <span className="font-semibold text-[#00D1FF]">{step.type}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Agent:{" "}
                    <span className="text-foreground font-medium">{step.agent || "N/A"}</span>
                  </div>
                </div>

                {/* TOKEN FLOW */}
                <div className="flex flex-col items-center gap-1">
                  {/* Token In row  */}
                  {hasIn && (
                    <div className="flex justify-between w-full max-w-[220px]">
                      <span className="text-sm text-muted-foreground">
                        {step.tokenIn?.amount ?? "N/A"}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {step.tokenIn?.symbol || "N/A"}
                      </span>
                    </div>
                  )}

                  {/* Arrow  */}
                  {hasIn && hasOut && (
                    <ArrowDown className="w-4 h-4 text-muted-foreground my-1" />
                  )}

                  {/* Token Out row */}
                  {hasOut && (
                    <div className="flex justify-between w-full max-w-[220px]">
                      <span className="text-sm text-muted-foreground">
                        {step.tokenOut?.amount ?? "N/A"}
                      </span>
                      <span className="text-sm font-semibold text-green-500">
                        {step.tokenOut?.symbol || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* === RIGHT: INFO SUMMARY === */}
        <div className="w-full lg:w-1/3 space-y-4">
          {[
            {
              label: "Initial Capital",
              value: `${initialCapital?.symbol || "N/A"} (${initialCapital?.assetId || "-"})`,
            },
            { label: "Loops", value: loops ?? "N/A" },
            { label: "Fee", value: fee ?? 0 },
            { label: "Total Supply", value: totalSupply ?? 0 },
            { label: "Total Borrow", value: totalBorrow ?? 0 },
          ].map((info, i) => (
            <div
              key={i}
              className="glass p-3 rounded-lg border border-primary/20"
            >
              <div className="font-semibold text-[#00D1FF]">{info.label}</div>
              <div className="text-sm text-muted-foreground">{info.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
