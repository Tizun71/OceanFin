"use client"

import { ArrowDown, Bot, Workflow } from "lucide-react"
import { motion } from "framer-motion"

interface TokenInfo {
  assetId?: string | number
  symbol?: string
  amount?: string | number | null
}

interface FlowStep {
  step: number
  type: string
  agent: string
  tokenIn?: TokenInfo | null
  tokenOut?: TokenInfo | null
}

interface StrategyFlowProps {
  steps?: FlowStep[]
  initialCapital?: TokenInfo
  loops?: number
  fee?: number
  totalSupply?: number
  totalBorrow?: number
}

export function StrategyFlow({
  steps = [],
  initialCapital,
  loops,
  fee,
  totalSupply,
  totalBorrow,
}: StrategyFlowProps) {
  const validSteps = Array.isArray(steps) ? steps : []

  if (!validSteps.length) {
    return (
      <div className="rounded-lg p-6 text-center text-muted-foreground bg-card border border-border">
        No flow data available. Please run a simulation first.
      </div>
    )
  }

  return (
    <div className="p-3">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
        </h3>
        <span className="text-xs text-muted-foreground">
          Total Steps:{" "}
          <span className="text-primary font-bold">{validSteps.length}</span>
        </span>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: STEPS */}
        <div className="lg:col-span-7 flex flex-col items-center gap-6 relative max-h-[350px] overflow-y-auto pr-2">
          {validSteps.map((step, idx) => {
            const hasIn = !!step.tokenIn
            const hasOut = !!step.tokenOut

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative w-full max-w-[360px] bg-card backdrop-blur-md border border-border rounded-lg 
                           shadow-lg hover:shadow-xl hover:border-accent/50
                           transition-all duration-300 p-3 flex flex-col justify-between min-h-[70px]"
              >
                {/* Step Header */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-md">
                      {step.step}
                    </div>
                    <h4 className="text-foreground font-semibold text-[12px] tracking-wide">
                      {step.type}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Bot className="w-3 h-3 text-primary" />
                    <span className="font-semibold">{step.agent || "N/A"}</span>
                  </div>
                </div>

                {/* Token In */}
                {hasIn && (
                  <div className="flex justify-between text-[10.5px] text-card-foreground border-t border-border pt-1">
                    <span>{step.tokenIn?.amount ?? "N/A"}</span>
                    <span className="font-semibold text-primary">
                      {step.tokenIn?.symbol || "N/A"}
                    </span>
                  </div>
                )}

                {/* Arrow */}
                {hasIn && hasOut && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className="w-2.5 h-2.5 text-primary animate-bounce" />
                  </div>
                )}

                {/* Token Out */}
                {hasOut && (
                  <div className="flex justify-between text-[10.5px] text-card-foreground border-t border-border pt-1">
                    <span>{step.tokenOut?.amount ?? "N/A"}</span>
                    <span className="font-semibold text-accent">
                      {step.tokenOut?.symbol || "N/A"}
                    </span>
                  </div>
                )}

                {/* Connector Arrow */}
                {idx < validSteps.length - 1 && (
                  <div className="absolute left-1/2 -bottom-5 transform -translate-x-1/2">
                    <ArrowDown className="w-3.5 h-3.5 text-primary/60 animate-bounce" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* RIGHT: STATISTICS */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card backdrop-blur-md rounded-xl border border-border
                       shadow-lg hover:shadow-xl hover:border-accent/50
                       transition-all duration-500 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <h4 className="text-foreground font-bold text-xs uppercase tracking-wide">
                Statistics Overview
              </h4>
              <button className="text-primary text-[10px] font-semibold hover:underline">
                View All &gt;
              </button>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {[
                {
                  icon: "💰",
                  label: "Initial Capital",
                  value: `${initialCapital?.symbol || "N/A"} (${initialCapital?.assetId || "-"})`,
                  sub: "Base asset",
                },
                { icon: "🔁", label: "Loops", value: loops ?? "N/A", sub: "Total cycle count" },
                { icon: "💸", label: "Fee", value: `${fee ?? 0}%`, sub: "Execution fee" },
                { icon: "📈", label: "Total Supply", value: totalSupply ?? 0, sub: "Supplied amount" },
                { icon: "📉", label: "Total Borrow", value: totalBorrow ?? 0, sub: "Borrowed amount" },
              ].map((info, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-accent/5 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base">
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-xs">
                        {info.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{info.sub}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-accent font-semibold text-xs">
                      {info.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
