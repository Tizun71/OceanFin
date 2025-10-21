"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2, AlertCircle, Zap } from "lucide-react"
import type { StrategySimulate, Step as StrategyStep } from "@/types/strategy.type"
import { STEP_TYPE, TEST_USER_PUBLIC_ADDRESS } from "@/utils/constant"
import { buildStepTx } from "@/services/strategy-step-service"
import { getHydrationSDK, disconnectHydrationSDK } from "@/api/hydration/external/sdkClient"

type ExecutionStatus = "pending" | "processing" | "completed" | "failed"

interface ExecutionStep {
  id: string
  title: string
  description: string
  status: ExecutionStatus
  original?: StrategyStep
}

interface ExecutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategy: StrategySimulate
}

/* ----------------------------- helpers (pure) ----------------------------- */

const formatAmt = (v?: number) => (typeof v === "number" ? Number(v.toFixed(6)) : "-")

const getStepTitle = (s: StrategyStep) => {
  switch (s.type) {
    case STEP_TYPE.ENABLE_BORROWING:
      return "Enable Borrowing"
    case STEP_TYPE.ENABLE_E_MODE:
      return "Enable E-Mode"
    case STEP_TYPE.JOIN_STRATEGY:
      return `Swap ${s.tokenIn?.symbol ?? ""} → ${s.tokenOut?.symbol ?? ""}`
    case STEP_TYPE.BORROW:
      return `Borrow ${s.tokenOut?.symbol ?? ""}`
    default:
      return `Step ${s.step}`
  }
}

const getStepDescription = (s: StrategyStep) => {
  switch (s.type) {
    case STEP_TYPE.ENABLE_BORROWING:
      return "Enable borrowing on protocol"
    case STEP_TYPE.ENABLE_E_MODE:
      return "Enable efficiency mode"
    case STEP_TYPE.JOIN_STRATEGY:
      return `Swap ${formatAmt(s.tokenIn?.amount)} ${s.tokenIn?.symbol ?? ""} for ~${formatAmt(
        s.tokenOut?.amount,
      )} ${s.tokenOut?.symbol ?? ""}`
    case STEP_TYPE.BORROW:
      return `Borrow ${formatAmt(s.tokenOut?.amount)} ${s.tokenOut?.symbol ?? ""}`
    default:
      return "Execute step"
  }
}

const buildExecutionSteps = (strategy?: StrategySimulate): ExecutionStep[] => {
  return (
    strategy?.steps?.map((s, i) => ({
      id: `${s.step ?? i + 1}`,
      title: getStepTitle(s),
      description: getStepDescription(s),
      status: "pending" as const,
      original: s,
    })) ?? []
  )
}

const statusStyles: Record<ExecutionStatus, string> = {
  completed: "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20",
  processing: "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/30",
  failed: "border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20",
  pending: "border-slate-700/50 bg-slate-900/30",
}

/* ------------------------------ sub-components ----------------------------- */

function StepItem({
  step,
  index,
}: {
  step: ExecutionStep
  index: number
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm ${statusStyles[step.status]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {step.status === "completed" && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          {step.status === "processing" && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
          {step.status === "failed" && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/50">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          )}
          {step.status === "pending" && (
            <div className="w-6 h-6 rounded-full border-2 border-slate-600 bg-slate-800/50 flex items-center justify-center">
              <span className="text-xs text-slate-400 font-semibold">{index + 1}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1 text-sm">{step.title}</h4>
          <p className="text-xs text-muted-foreground">{step.description}</p>
          {step.status === "processing" && (
            <p className="text-xs text-cyan-400 mt-2 animate-pulse font-medium">Waiting for confirmation...</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- main ---------------------------------- */

export function ExecutionModal({ open, onOpenChange, strategy }: ExecutionModalProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const abortRef = useRef(false)

  useEffect(() => {
    if (!open) return
    setExecutionSteps(buildExecutionSteps(strategy))
    setIsExecuting(false)
  }, [open, strategy])

  useEffect(() => {
    abortRef.current = false
    return () => {
      abortRef.current = true
    }
  }, [])

  const subtitle = useMemo(() => {
    return strategy?.initialCapital
      ? `Initial: ${formatAmt(strategy.initialCapital.amount)} ${strategy.initialCapital.symbol} • Loops: ${strategy.loops}`
      : `Loops: ${strategy?.loops ?? "-"}`
  }, [strategy])

  const startExecution = async () => {
    if (!executionSteps.length || isExecuting) return

    setIsExecuting(true)
    let sdkOpened = false

    const originals = executionSteps.map((s) => s.original)

    try {
      await getHydrationSDK()
      sdkOpened = true

      for (let i = 0; i < originals.length; i++) {
        if (abortRef.current) break

        setExecutionSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "processing" } : idx < i ? { ...s, status: "completed" } : s,
          ),
        )

        const original = originals[i]
        try {
          if (original) {
            const tx = await buildStepTx(original, TEST_USER_PUBLIC_ADDRESS)
            console.log("Built tx for step:", original.type, tx)
          }

          if (abortRef.current) break

          setExecutionSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "completed" } : s)))
        } catch (err) {
          if (abortRef.current) break

          setExecutionSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "failed" } : s)))

          break
        }
      }
    } catch {
      // keep statuses set above
    } finally {
      if (sdkOpened) {
        try {
          await disconnectHydrationSDK()
        } catch {
          // ignore disconnect errors
        }
      }
      setIsExecuting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-white backdrop-blur-xl border border-slate-800/50 shadow-2xl shadow-slate-950/50">
        <DialogHeader className="pb-4 border-b border-slate-800/30 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Execute Strategy
            </DialogTitle>
          </div>
          <p className="text-xl text-slate-500 font-medium">{subtitle}</p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {executionSteps.map((step, index) => (
            <StepItem key={step.id} step={step} index={index} />
          ))}

          {!executionSteps.length && (
            <div className="text-sm text-slate-400 text-center py-8">No steps to execute.</div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800/30">
          <Button
            variant="outline"
            className="flex-1 bg-slate-900/50 hover:bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 text-slate-300 hover:text-slate-100 transition-all duration-200 rounded-lg font-medium"
            onClick={() => onOpenChange(false)}
            disabled={isExecuting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={startExecution}
            disabled={isExecuting || !executionSteps.length}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Execution
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
