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
      <div className="rounded-lg p-6 text-center text-gray-500 bg-gray-50 border border-gray-200">
        No flow data available. Please run a simulation first.
      </div>
    )
  }

  return (
    <div className="p-4 overflow-x-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Workflow className="w-4.5 h-4.5 text-blue-500" />
        </h3>
        <span className="text-sm text-gray-600">
          Total Steps:{" "}
          <span className="text-blue-500 font-bold">{validSteps.length}</span>
        </span>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: STEPS */}
        <div className="lg:col-span-7 flex flex-col items-center gap-9 relative">
          {validSteps.map((step, idx) => {
            const hasIn = !!step.tokenIn
            const hasOut = !!step.tokenOut

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative w-full max-w-[360px] bg-white/75 backdrop-blur-md border border-transparent rounded-lg 
                           shadow-[0_0_15px_rgba(0,150,255,0.25)] hover:shadow-[0_0_25px_rgba(0,180,255,0.45)] 
                           transition-all duration-300 p-3.5 flex flex-col justify-between min-h-[80px]"
              >
                {/* Step Header */}
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center text-[11px] font-bold shadow-md">
                      {step.step}
                    </div>
                    <h4 className="text-gray-800 font-semibold text-[13px] tracking-wide">
                      {step.type}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Bot className="w-3 h-3 text-blue-400" />
                    <span className="font-semibold">{step.agent || "N/A"}</span>
                  </div>
                </div>

                {/* Token In */}
                {hasIn && (
                  <div className="flex justify-between text-[11.5px] text-gray-700 border-t border-gray-200 pt-1.5">
                    <span>{step.tokenIn?.amount ?? "N/A"}</span>
                    <span className="font-semibold text-blue-600">
                      {step.tokenIn?.symbol || "N/A"}
                    </span>
                  </div>
                )}

                {/* Arrow */}
                {hasIn && hasOut && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-3 h-3 text-blue-400 animate-bounce" />
                  </div>
                )}

                {/* Token Out */}
                {hasOut && (
                  <div className="flex justify-between text-[11.5px] text-gray-700 border-t border-gray-200 pt-1.5">
                    <span>{step.tokenOut?.amount ?? "N/A"}</span>
                    <span className="font-semibold text-emerald-600">
                      {step.tokenOut?.symbol || "N/A"}
                    </span>
                  </div>
                )}

                {/* Connector Arrow */}
                {idx < validSteps.length - 1 && (
                  <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2">
                    <ArrowDown className="w-4 h-4 text-blue-300 animate-bounce" />
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
            className="bg-white/70 backdrop-blur-md rounded-xl border border-transparent 
                       shadow-[0_0_20px_rgba(0,150,255,0.25)] hover:shadow-[0_0_30px_rgba(0,180,255,0.45)] 
                       transition-all duration-500 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h4 className="text-gray-800 font-bold text-sm uppercase tracking-wide">
                Statistics Overview
              </h4>
              <button className="text-blue-500 text-xs font-semibold hover:underline">
                View All &gt;
              </button>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
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
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-lg">
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {info.label}
                      </div>
                      <div className="text-xs text-gray-500">{info.sub}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-semibold text-sm">
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
