"use client"

import { motion } from "framer-motion"
import { Check, Loader2, AlertCircle, ChevronRight } from "lucide-react"
import type { ExecutionStep } from "./types"

interface AnimatedStepProps {
  steps: ExecutionStep[]
  currentIndex: number
  explorerBase?: string
}

const statusStyles = {
  completed: "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20",
  processing: "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/30",
  failed: "border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20",
  pending: "border-slate-700/50 bg-slate-900/30",
}

export function AnimatedStep({ steps, currentIndex, explorerBase }: AnimatedStepProps) {
  return (
    <div className="flex flex-col items-center justify-start w-full space-y-4">
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const status = step.status
          const txUrl =
            step.txHash && explorerBase
              ? `${explorerBase.replace(/\/$/, "")}/extrinsic/${step.txHash}`
              : undefined

          return (
            <motion.div
              key={step.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className={`p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                statusStyles[status]
              } w-[340px] ${isActive ? "ring-2 ring-cyan-500/40" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {status === "completed" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {status === "processing" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  {status === "failed" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {status === "pending" && (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600 bg-slate-800/50 flex items-center justify-center">
                      <span className="text-xs text-slate-400 font-semibold">{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* step */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1 text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>

                  {status === "processing" && (
                    <p className="text-xs text-cyan-400 mt-2 animate-pulse font-medium">
                      Executing...
                    </p>
                  )}
                  {status === "failed" && (
                    <p className="text-xs text-red-400 mt-2 font-medium">Step failed.</p>
                  )}

                  {status === "completed" && step.txHash && (
                    <div className="mt-2 pt-2 border-t border-slate-700/40">
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                      {txUrl ? (
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline"
                        >
                          {step.txHash.slice(0, 8)}...{step.txHash.slice(-6)}
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs font-mono text-emerald-400">
                          {step.txHash.slice(0, 8)}...{step.txHash.slice(-6)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
