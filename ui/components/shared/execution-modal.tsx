"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { StrategySimulate, Step as StrategyStep } from "@/types/strategy.type"
import type { ExecutionStatus, ExecutionStep } from "./types"
import { STEP_TYPE } from "@/utils/constant"
import { buildStepTx } from "@/services/strategy-step-service"
import { useLunoPapiClient } from "@/hooks/use-luno-papiclient"
import { AnimatedStep } from "./animated-step"
import { motion } from "framer-motion"

interface ExecutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategy: StrategySimulate
  startFromStep?: number 
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
  if (!strategy?.steps || !Array.isArray(strategy.steps)) {
    console.warn("No steps found in strategy:", strategy)
    return []
  }
  
  return strategy.steps.map((s, i) => ({
    id: `${s.step ?? i + 1}`,
    title: getStepTitle(s),
    description: getStepDescription(s),
    status: "pending" as const,
    txHash: undefined,
  }))
}

/* --------------------------------- main ---------------------------------- */

export function ExecutionModal({ open, onOpenChange, strategy, startFromStep = 0 }: ExecutionModalProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const abortRef = useRef(false)

  const {
    sendTransaction,
    walletAddress,
    isWalletConnected,
    currentChain,
  } = useLunoPapiClient()

  useEffect(() => {
    if (open && strategy) {
      console.log("Building execution steps from strategy:", strategy)
      console.log("Starting from step:", startFromStep)
      
      const steps = buildExecutionSteps(strategy)
      
      const stepsWithStatus = steps.map((step, idx) => ({
        ...step,
        status: (idx < startFromStep ? "completed" : "pending") as ExecutionStatus
      }))
      
      console.log("Built steps:", stepsWithStatus)
      setExecutionSteps(stepsWithStatus)
      setIsExecuting(false)
      setCurrentStepIndex(startFromStep)
    }
  }, [open, strategy, startFromStep])

  const subtitle = useMemo(() => {
    const resumeText = startFromStep > 0 ? ` • Resuming from step ${startFromStep + 1}` : ""
    return strategy?.initialCapital
      ? `Initial: ${formatAmt(strategy.initialCapital.amount)} ${strategy.initialCapital.symbol} • Loops: ${strategy.loops}${resumeText}`
      : `Loops: ${strategy?.loops ?? "-"}${resumeText}`
  }, [strategy, startFromStep])

  const startExecution = async () => {
    if (!executionSteps.length || isExecuting) {
      console.warn("⚠️ Cannot start execution:", { 
        hasSteps: executionSteps.length > 0, 
        isExecuting 
      })
      return
    }
    if (!isWalletConnected || !walletAddress) {
      alert("Please connect your wallet first")
      return
    }

    console.log("🚀 Starting execution with", executionSteps.length, "steps")
    console.log("📍 Starting from step index:", startFromStep)
    setIsExecuting(true)
    abortRef.current = false

    try {
      const originalSteps = strategy?.steps || []

      for (let i = startFromStep; i < originalSteps.length; i++) {
        if (abortRef.current) break

        console.log(`\n📍 Executing step ${i + 1}/${originalSteps.length}:`, originalSteps[i])
        setCurrentStepIndex(i)

        setExecutionSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "processing" } : s)),
        )

        try {
          const step = originalSteps[i]
          if (!step) continue

          const tx = await buildStepTx(step, walletAddress)
          
          if (!tx) {
            console.log(`⏭️ Step ${i} (${step.type}) does not require transaction, marking as completed`)
            setExecutionSteps((prev) =>
              prev.map((s, idx) => 
                idx === i 
                  ? { ...s, status: "completed" as const } 
                  : s
              ),
            )
            
            if (i < originalSteps.length - 1) {
              await new Promise((r) => setTimeout(r, 1000))
            }
            continue
          }

          console.log(`🔐 Step ${i} (${step.type}): Requesting signature...`)
          const result = await sendTransaction(tx)
          console.log(`📝 Step ${i} result:`, result)

          if (abortRef.current) break

          if (result?.status === "failed" || result?.errorMessage) {
            throw new Error(result?.errorMessage || "Transaction failed on blockchain")
          }

          if (result?.transactionHash) {
            setExecutionSteps((prev) =>
              prev.map((s, idx) => 
                idx === i 
                  ? { ...s, status: "completed" as const, txHash: result.transactionHash || undefined } 
                  : s
              ),
            )
          } else {
            throw new Error("No transaction hash returned")
          }

          if (i < originalSteps.length - 1) {
            await new Promise((r) => setTimeout(r, 2000))
          }
        } catch (err) {
          console.error(`❌ Step ${i} failed:`, err)
          setExecutionSteps((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: "failed" } : s)),
          )
          alert(`Step ${i + 1} failed: ${err instanceof Error ? err.message : String(err)}`)
          break
        }
      }
    } catch (err) {
      console.error("❌ Execution error:", err)
      alert(`Execution failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      console.log("✅ Execution finished")
      setIsExecuting(false)
    }
  }

  const handleCancel = () => {
    abortRef.current = true
    setIsExecuting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-border">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold text-primary">Execute Strategy</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1.5">
            {subtitle} • Step {currentStepIndex + 1} of {executionSteps.length}
          </p>
        </DialogHeader>
        
        <div className="relative w-full overflow-hidden py-8 flex items-center justify-center bg-gradient-to-b from-accent/5 to-primary/5 rounded-2xl">
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

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
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
                className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold"
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