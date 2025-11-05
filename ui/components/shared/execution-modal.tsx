"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2, AlertCircle, ChevronRight } from "lucide-react"
import type { StrategySimulate, Step as StrategyStep } from "@/types/strategy.type"
import { STEP_TYPE } from "@/utils/constant"
import { buildStepTx } from "@/services/strategy-step-service"
import { disconnectHydrationSDK } from "@/api/hydration/external/sdkClient"
import { useLunoPapiClient } from "@/hooks/use-luno-papiclient"
import { AnimatedStep } from "./animated-step"
import { motion } from "framer-motion"
type ExecutionStatus = "pending" | "processing" | "completed" | "failed"

interface ExecutionStep {
  id: string
  title: string
  description: string
  status: ExecutionStatus
  original?: StrategyStep
  txHash?: string
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

/* ------------------------------ sub-components ----------------------------- */

function StepItem({
  step,
  index,
  explorerBase,
}: {
  step: ExecutionStep
  index: number
  explorerBase?: string
}) {
  const txUrl = step.txHash && explorerBase ? `${explorerBase.replace(/\/$/, "")}/extrinsic/${step.txHash}` : undefined

  const statusConfig = {
    completed: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      icon: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    processing: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
    },
    failed: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
    },
    pending: {
      bg: "bg-slate-500/5",
      border: "border-slate-300 dark:border-slate-700",
      icon: "bg-slate-200 dark:bg-slate-700",
      text: "text-slate-500 dark:text-slate-400",
    },
  }

  const config = statusConfig[step.status]

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-300 ${config.bg} ${config.border} hover:border-opacity-50`}
    >
      {step.status !== "pending" && (
        <div className="absolute -left-[17px] top-12 w-[2px] h-8 bg-gradient-to-b from-current to-transparent opacity-30" />
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {step.status === "completed" && (
            <div
              className={`w-8 h-8 rounded-full ${config.icon} flex items-center justify-center shadow-lg shadow-emerald-500/20`}
            >
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          )}
          {step.status === "processing" && (
            <div
              className={`w-8 h-8 rounded-full ${config.icon} flex items-center justify-center shadow-lg shadow-blue-500/20`}
            >
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
          {step.status === "failed" && (
            <div
              className={`w-8 h-8 rounded-full ${config.icon} flex items-center justify-center shadow-lg shadow-red-500/20`}
            >
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          )}
          {step.status === "pending" && (
            <div
              className={`w-8 h-8 rounded-full ${config.icon} border-2 border-slate-400 dark:border-slate-600 flex items-center justify-center font-semibold text-sm text-slate-600 dark:text-slate-400`}
            >
              {index + 1}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground leading-tight mb-1.5">{step.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{step.description}</p>

          {step.status === "processing" && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Waiting for confirmation...</p>
            </div>
          )}

          {step.status === "completed" && step.txHash && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
              {txUrl ? (
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1 text-xs font-mono ${config.text} hover:underline transition-colors`}
                >
                  {step.txHash.slice(0, 8)}...{step.txHash.slice(-6)}
                  <ChevronRight className="w-3 h-3" />
                </a>
              ) : (
                <span className={`text-xs font-mono ${config.text}`}>
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

/* --------------------------------- main ---------------------------------- */

export function ExecutionModal({ open, onOpenChange, strategy }: ExecutionModalProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const abortRef = useRef(false)

  const {
    sendTransaction,
    walletAddress,
    isWalletConnected,
    isReady,
    currentChain,
  } = useLunoPapiClient()

  useEffect(() => {
    if (!open) {
      setExecutionSteps(buildExecutionSteps(strategy))
      setIsExecuting(false)
      setCurrentStepIndex(0) // Reset step index when modal opens/closes
    }
  }, [open, strategy])

  const subtitle = useMemo(() => {
    return strategy?.initialCapital
      ? `Initial: ${formatAmt(strategy.initialCapital.amount)} ${strategy.initialCapital.symbol} • Loops: ${strategy.loops}`
      : `Loops: ${strategy?.loops ?? "-"}`
  }, [strategy])

  const startExecution = async () => {
    if (!executionSteps.length || isExecuting) return
    if (!isWalletConnected || !walletAddress) {
      alert("Please connect your wallet first")
      return
    }

    setIsExecuting(true)
    abortRef.current = false

    try {
      const originals = executionSteps.map((s) => s.original).filter(Boolean)

      for (let i = 0; i < originals.length; i++) {
        if (abortRef.current) break

        setCurrentStepIndex(i)

        // Update status of current step
        setExecutionSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "processing" } : s)),
        )

        try {
          const step = originals[i]
          if (!step) continue

          const tx = await buildStepTx(step, walletAddress)
          if (tx) {
            const result = await sendTransaction(tx)

            if (abortRef.current) break

            if (result?.transactionHash) {
              setExecutionSteps((prev) =>
                prev.map((s, idx) => (idx === i ? { ...s, status: "completed", txHash: result.transactionHash } : s)),
              )
            } else {
              throw new Error(result?.errorMessage || "Transaction failed")
            }


          }

          // Wait before next step
          if (i < originals.length - 1) {
            await new Promise((r) => setTimeout(r, 2000))
          }
        } catch (err) {
          setExecutionSteps((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: "failed" } : s)),
          )
          break
        }
      }
    } catch (err) {
      console.error("Execution error:", err)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCancel = () => {
    abortRef.current = true
    setIsExecuting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Execute Strategy</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1.5">
            {subtitle} • Step {currentStepIndex + 1} of {executionSteps.length}
          </p>
        </DialogHeader>
        <div className="relative w-full overflow-hidden py-8 flex items-center justify-center bg-gradient-to-b from-ocean-50/30 to-ocean-100/10 rounded-2xl">
          {executionSteps.length > 0 ? (
            <AnimatedStep
              steps={executionSteps}
              currentIndex={currentStepIndex}
              explorerBase={currentChain?.blockExplorers?.default?.url}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground">No steps to execute.</p>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          {isExecuting ? (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel Execution
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={startExecution}
                disabled={!executionSteps.length || !isWalletConnected}
              >
                {!isWalletConnected ? 'Connect Wallet' : 'Start Execution'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

