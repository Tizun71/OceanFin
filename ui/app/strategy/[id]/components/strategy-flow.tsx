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
    <div className="glass rounded-lg p-6">
      {/* === HEADER === */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent flex items-center gap-2">
          <Workflow className="w-5 h-5 text-[#00D1FF]" />
          Strategy Flow
        </h3>
        <span className="text-sm text-muted-foreground">
          Total Steps:{" "}
          <span className="text-[#00D1FF] font-semibold">
            {validSteps.length}
          </span>
        </span>
      </div>

      {/* === INFO SUMMARY === */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-6 text-sm text-muted-foreground">
        <div className="glass p-3 rounded-lg border border-primary/20">
          <div className="font-semibold text-[#00D1FF]">Initial Capital</div>
          <div>
            {initialCapital?.symbol || "N/A"} ({initialCapital?.assetId})
          </div>
        </div>
        <div className="glass p-3 rounded-lg border border-primary/20">
          <div className="font-semibold text-[#00D1FF]">Loops</div>
          <div>{loops ?? "N/A"}</div>
        </div>
        <div className="glass p-3 rounded-lg border border-primary/20">
          <div className="font-semibold text-[#00D1FF]">Fee</div>
          <div>{fee ?? 0}</div>
        </div>
        <div className="glass p-3 rounded-lg border border-primary/20">
          <div className="font-semibold text-[#00D1FF]">Total Supply</div>
          <div>{totalSupply ?? 0}</div>
        </div>
        <div className="glass p-3 rounded-lg border border-primary/20">
          <div className="font-semibold text-[#00D1FF]">Total Borrow</div>
          <div>{totalBorrow ?? 0}</div>
        </div>
      </div>

      {/* === MAIN FLOW === */}
      <div className="flex flex-col items-center space-y-8">
        {validSteps.map((step, idx) => (
          <div
            key={idx}
            className="w-full lg:w-3/4 glass rounded-lg border border-primary/20 p-4"
          >
            {/* STEP HEADER */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {step.step}
                  </span>
                </div>
                <span className="font-semibold text-[#00D1FF]">
                  {step.type}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Agent: {step.agent || "N/A"}
              </span>
            </div>

            {/* TOKEN FLOW */}
            <div className="flex flex-col items-center space-y-2">
              {/* Token In */}
              {step.tokenIn && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {step.tokenIn.symbol?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {step.tokenIn.symbol}
                  </span>
                </div>
              )}

              {/* Arrow */}
              {step.tokenIn && step.tokenOut && (
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              )}

              {/* Token Out */}
              {step.tokenOut && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-500">
                      {step.tokenOut.symbol?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {step.tokenOut.symbol}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
