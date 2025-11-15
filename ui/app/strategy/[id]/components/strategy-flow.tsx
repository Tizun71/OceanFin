"use client"

import { ArrowDown, Bot, Workflow, Coins, Repeat, DollarSign } from "lucide-react"
import { motion } from "framer-motion";
import { assetIcons } from "@/lib/iconMap";
import { Badge } from "@/components/ui/badge";

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
}

export function StrategyFlow({
  steps = [],
  initialCapital,
  loops,
  fee,
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
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Workflow className="w-5 h-5 text-primary" />
          Strategy Flow
        </h3>
        <Badge variant={"outline"}>
          <span className="text-xs text-muted-foreground">
            Total Steps:{" "}
            <span className="text-primary font-bold">{validSteps.length}</span>
          </span>
        </Badge>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-7 flex flex-col items-center gap-6 relative max-h-[350px] overflow-y-auto pr-2">

          {validSteps.map((step, idx) => {
            const hasIn = !!step.tokenIn
            const hasOut = !!step.tokenOut
            const hasBoth = hasIn && hasOut

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative w-full max-w-[360px] bg-card backdrop-blur-md border
                           border-border rounded-lg shadow-lg hover:shadow-xl hover:border-accent/50
                           transition-all duration-300 p-3 flex flex-col min-h-[120px]"
              >

                {/* Step Header */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent 
                                   text-primary-foreground flex items-center justify-center 
                                   text-[11px] font-bold shadow-md">
                      {step.step}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground tracking-wide">
                      {step.type}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Bot className="w-3 h-3 text-primary" />
                    <span className="font-semibold">{step.agent || "N/A"}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">

                  {/* Token In */}
                  <div className="flex-1 flex justify-between items-center text-xs 
                                  text-card-foreground border-t border-border pt-1 px-1">
                    {hasIn ? (
                      <>
                        <span>{step.tokenIn?.amount ?? "N/A"}</span>

                        <span className="font-semibold text-primary flex items-center gap-1">
                          {step.tokenIn?.symbol && (
                            <img
                              src={
                                assetIcons[step.tokenIn.symbol] ||
                                assetIcons[step.tokenIn.symbol?.toUpperCase()] ||
                                assetIcons[step.tokenIn.symbol?.toLowerCase()] ||
                                "/icons/default.png"
                              }
                              alt={step.tokenIn.symbol}
                              className="w-4 h-4 rounded-full object-contain bg-white border border-border"
                            />
                          )}
                          <span>{step.tokenIn?.symbol || "N/A"}</span>
                        </span>
                      </>
                    ) : (
                      <span className="opacity-0">placeholder</span>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex-1 flex justify-center items-center">
                    {hasBoth ? (
                      <ArrowDown className="w-3 h-3 text-primary animate-bounce" />
                    ) : (
                      <span className="opacity-0">placeholder</span>
                    )}
                  </div>

                  {/* Token Out */}
                  <div className="flex-1 flex justify-between items-center text-xs 
                                  text-card-foreground border-t border-border pt-1 px-1">
                    {hasOut ? (
                      <>
                        <span>{step.tokenOut?.amount ?? "N/A"}</span>

                        <span className="font-semibold text-primary flex items-center gap-1">
                          {step.tokenOut?.symbol && (
                            <img
                              src={
                                assetIcons[step.tokenOut.symbol] ||
                                assetIcons[step.tokenOut.symbol?.toUpperCase()] ||
                                assetIcons[step.tokenOut.symbol?.toLowerCase()] ||
                                "/icons/default.png"
                              }
                              alt={step.tokenOut.symbol}
                              className="w-4 h-4 rounded-full object-contain bg-white border border-border"
                            />
                          )}
                          <span>{step.tokenOut?.symbol || "N/A"}</span>
                        </span>
                      </>
                    ) : (
                      <span className="opacity-0">placeholder</span>
                    )}
                  </div>
                </div>

                {/* Connector Arrow */}
                {idx < validSteps.length - 1 && (
                  <div className="absolute left-1/2 -bottom-5 transform -translate-x-1/2">
                    <ArrowDown className="w-4 h-4 text-primary/60 animate-bounce" />
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
                       shadow-lg hover:shadow-xl hover:border-accent/50 transition-all duration-500"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <h4 className="text-sm font-bold text-foreground tracking-wide">
                Statistics Overview
              </h4>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {[
                {
                  icon: <Coins className="w-4 h-4" />,
                  label: "Initial Capital",
                  value: (
                    <span className="flex items-center gap-1 text-xs">
                      {initialCapital?.amount || "0"}
                      {initialCapital?.symbol && (
                        <img
                          src={
                            assetIcons[initialCapital.symbol] ||
                            assetIcons[initialCapital.symbol?.toUpperCase()] ||
                            assetIcons[initialCapital.symbol?.toLowerCase()] ||
                            "/icons/default.png"
                          }
                          alt={initialCapital.symbol}
                          className="w-4 h-4 rounded-full object-contain bg-white border border-border"
                        />
                      )}
                      <span>{initialCapital?.symbol || "N/A"}</span>
                    </span>
                  ),
                  sub: "Base asset",
                },
                { icon: <Repeat className="w-4 h-4" />, label: "Loops", value: loops ?? "N/A", sub: "Total cycle count" },
                { icon: <DollarSign className="w-4 h-4" />, label: "Fee", value: `${fee ?? 0}`, sub: "Execution fee" },
              ].map((info, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-accent/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{info.label}</div>
                      <div className="text-[11px] text-muted-foreground">{info.sub}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-semibold text-accent">
                    {info.value}
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
