"use client";

import { ArrowDown, Bot, Workflow } from "lucide-react";

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
      {/* HEADER */}
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

      {/* MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 w-fit mx-auto flex flex-col items-center">
          {/* LEFT: STEPS */}
          <div className="flex-1 flex flex-col items-center space-y-4">
            {validSteps.map((step, idx) => {
              const hasIn = !!step.tokenIn;
              const hasOut = !!step.tokenOut;

              return (
                <div key={idx} className="flex flex-col items-center w-full">
                  {/* STEP CARD */}
                  <div className="glass w-[320px] rounded-lg border border-primary/20 p-4 hover:border-[#00D1FF]/40 transition-all duration-200 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{step.step}</span>
                        </div>
                        <span className="font-semibold text-[#00D1FF]">{step.type}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground leading-none">
                        <Bot className="w-3.5 h-3.5 text-[#00D1FF] align-middle" />
                        <span className="text-foreground font-medium leading-none">{step.agent || "N/A"}</span>
                      </div>
                    </div>
                    {/* Token In */}
                    {hasIn && (
                      <>
                        <hr className="border-primary/10" />
                        <div className="flex justify-between w-full text-sm text-muted-foreground">
                          <span>{step.tokenIn?.amount ?? "N/A"}</span>
                          <span className="font-semibold text-foreground">{step.tokenIn?.symbol || "N/A"}</span>
                        </div>
                      </>
                    )}

                    {/* Arrow between In & Out */}
                    {hasIn && hasOut && (
                      <div className="relative flex flex-col items-center w-full my-1">
                        <hr className="border-primary/10 w-full" />
                        <div className="absolute -top-2 bg-background px-1">
                          <ArrowDown className="w-4 h-4 text-muted-foreground animate-bounce-slow" />
                        </div>
                      </div>
                    )}

                    {/* Token Out */}
                    {hasOut && (
                      <>
                        {!hasIn && <hr className="border-primary/10" />}
                        <div className="flex justify-between w-full text-sm text-muted-foreground">
                          <span>{step.tokenOut?.amount ?? "N/A"}</span>
                          <span className="font-semibold text-green-500">
                            {step.tokenOut?.symbol || "N/A"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Arrow BETWEEN STEPS */}
                  {idx < validSteps.length - 1 && (
                    <div className="my-3">
                      <ArrowDown className="w-5 h-5 text-muted-foreground animate-bounce-slow" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* RIGHT: INFO SUMMARY */}
        <div className="w-full lg:w-1/3">
          <div className="glass p-4 rounded-lg border border-primary/20 bg-white transition-all duration-300 ease-in-out">
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
                className="
                  flex items-center justify-between py-2 px-3
                  border-b border-primary/10 last:border-none
                  rounded-md transition-all duration-300 ease-in-out
                  hover:bg-[#E6F9FF] hover:shadow-[0_0_8px_rgba(0,209,255,0.3)]
                "
              >
                <span className="font-medium text-[#00D1FF]">{info.label}</span>
                <span className="text-sm text-muted-foreground">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


