"use client"

import { Check, Loader2, AlertCircle, ChevronRight } from "lucide-react"
import type { ExecutionStatus, ExecutionStep } from "./types"

interface StepItemProps {
  step: ExecutionStep
  index: number
  explorerBase?: string
}

const statusStyles: Record<ExecutionStatus, string> = {
  completed: "border-emerald-400 bg-emerald-400/10",
  processing: "border-primary bg-primary/10 glow-pink",
  failed: "border-red-500 bg-red-500/10",
  pending: "border-border bg-background/50"
}

export function StepItem({ step, index, explorerBase }: StepItemProps) {
  const txUrl = step.txHash && explorerBase 
    ? `${explorerBase.replace(/\/$/, "")}/extrinsic/${step.txHash}` 
    : undefined

  return (
    <div className={`p-4 rounded-lg border transition-all duration-300 ${statusStyles[step.status]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {step.status === "completed" && (
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          {step.status === "processing" && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
          {step.status === "failed" && (
            <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          )}
          {step.status === "pending" && (
            <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">{index + 1}</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold mb-1">{step.title}</h4>
          <p className="text-sm text-muted-foreground">{step.description}</p>
          {step.status === "processing" && (
            <p className="text-xs text-primary mt-2 animate-pulse">Processing transaction...</p>
          )}
          {step.status === "completed" && step.txHash && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              {txUrl ? (
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 hover:underline"
                >
                  {step.txHash.slice(0, 8)}...{step.txHash.slice(-6)}
                  <ChevronRight className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs font-mono text-emerald-600">
                  {step.txHash.slice(0, 8)}...{step.txHash.slice(-6)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}