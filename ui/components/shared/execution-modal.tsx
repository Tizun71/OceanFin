"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { StrategySimulate, Step as StrategyStep } from "@/types/strategy.type"
import type { ExecutionStatus, ExecutionStep } from "./types"
import { STEP_TYPE } from "@/utils/constant"
import { buildStepTx } from "@/services/strategy-step-service"
import { useLunoPapiClient } from "@/hooks/use-luno-papiclient"
import { motion } from "framer-motion"
import { displayToast } from "./toast-manager"
import StepStack from "./execution-step-stack"
import { assetIcons } from "@/lib/iconMap"
import { createActivity, updateActivity } from "@/services/activity-service"
import type { UpdateActivityPayload } from "@/types/activity.interface"

interface ExecutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategy: StrategySimulate
  strategyId: string
  startFromStep?: number
  activityId?: string | null
}

/* ----------------------------- helpers (pure) ----------------------------- */

const formatAmt = (v?: number) => (typeof v === "number" ? Number(v.toFixed(6)) : "-")

const mapStatusToBackend = (status: 'completed' | 'failed'): 'SUCCESS' | 'FAILED' => {
  return status === 'completed' ? 'SUCCESS' : 'FAILED'
}

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
  
  return strategy.steps.map((s, i) => {
    const fromToken = s.tokenIn ? {
      icon: assetIcons[s.tokenIn.symbol],
      symbol: s.tokenIn.symbol,
    } : undefined

    const toToken = s.tokenOut ? {
      icon: assetIcons[s.tokenOut.symbol],
      symbol: s.tokenOut.symbol,
    } : undefined

    return {
      id: `${s.step ?? i + 1}`,
      title: getStepTitle(s),
      description: getStepDescription(s),
      status: "pending" as const,
      txHash: undefined,
      fromToken,
      fromAmount: s.tokenIn?.amount ? String(formatAmt(s.tokenIn.amount)) : undefined,
      toToken,
      toAmount: s.tokenOut?.amount ? String(formatAmt(s.tokenOut.amount)) : undefined,
    }
  })
}

/* --------------------------------- main ---------------------------------- */

export function ExecutionModal({ 
  open, 
  onOpenChange, 
  strategy, 
  strategyId, 
  startFromStep = 0,
  activityId: initialActivityId = null 
}: ExecutionModalProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activityId, setActivityId] = useState<string | null>(initialActivityId)
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)
  const abortRef = useRef(false)

  const {
    sendTransaction,
    walletAddress,
    isWalletConnected,
  } = useLunoPapiClient()

  // Initialize execution steps
  useEffect(() => {
    if (open && strategy) {
      console.log("Strategy ID:", strategyId)
      const steps = buildExecutionSteps(strategy)
      const stepsWithStatus = steps.map((step, idx) => ({
        ...step,
        status: (idx < startFromStep ? "completed" : "pending") as ExecutionStatus
      }))
      
      setExecutionSteps(stepsWithStatus)
      setIsExecuting(false)
      setCurrentStepIndex(startFromStep)
      setAllStepsCompleted(false)
      
      // Set activity ID from props if provided (re-execute scenario)
      setActivityId(initialActivityId)
    }
  }, [open, strategy, startFromStep, initialActivityId, strategyId])

  const subtitle = useMemo(() => {
    const resumeText = startFromStep > 0 ? ` • Resuming from step ${startFromStep + 1}` : ""
    const modeText = initialActivityId ? " (Re-execute)" : " (New)"
    return strategy?.initialCapital
      ? `Initial: ${formatAmt(strategy.initialCapital.amount)} ${strategy.initialCapital.symbol} • Loops: ${strategy.loops}${resumeText}${modeText}`
      : `Loops: ${strategy?.loops ?? "-"}${resumeText}${modeText}`
  }, [strategy, startFromStep, initialActivityId])

  // Update step status in UI
  const updateStepStatus = (stepIndex: number, status: ExecutionStatus, txHash?: string) => {
    setExecutionSteps((prev) =>
      prev.map((s, idx) => 
        idx === stepIndex 
          ? { ...s, status, ...(txHash && { txHash }) } 
          : s
      )
    )
  }

  // Update activity in backend
  const syncActivityProgress = async (stepIndex: number, status: 'completed' | 'failed', txHash?: string) => {
    if (!activityId) return

    try {
      const payload: UpdateActivityPayload = {
        activityId,
        step: stepIndex + 1,
        status: mapStatusToBackend(status),
        message: txHash 
          ? `Step ${stepIndex + 1} ${status} with txHash: ${txHash}`
          : `Step ${stepIndex + 1} ${status}`
      }
      
      await updateActivity(activityId, payload)
      console.log(`✅ Activity synced: step ${stepIndex + 1} - ${status}`)
    } catch (err) {
      console.error("⚠️ Failed to sync activity:", err)
    }
  }

  // Execute a single step
  const executeStep = async (stepIndex: number, step: StrategyStep) => {
    updateStepStatus(stepIndex, "processing")

    const tx = await buildStepTx(step, walletAddress!)
    
    // Steps that don't require transaction
    if (!tx) {
      console.log(`⏭️ Step ${stepIndex + 1} (${step.type}) - No transaction required`)
      updateStepStatus(stepIndex, "completed")
      return { success: true, skipDelay: stepIndex >= strategy.steps.length - 1 }
    }

    // Execute transaction
    console.log(`🔐 Step ${stepIndex + 1} (${step.type}) - Requesting signature...`)
    const result = await sendTransaction(tx)
    
    if (abortRef.current) {
      throw new Error("Execution cancelled by user")
    }

    if (result?.status === "failed" || result?.errorMessage) {
      throw new Error(result?.errorMessage || "Transaction failed")
    }

    if (!result?.transactionHash) {
      throw new Error("No transaction hash returned")
    }

    // Success
    updateStepStatus(stepIndex, "completed", result.transactionHash)
    displayToast("success", `Step ${stepIndex + 1} completed successfully.`)
    
    return { 
      success: true, 
      txHash: result.transactionHash,
      skipDelay: stepIndex >= strategy.steps.length - 1 
    }
  }

  // Main execution flow
  const startExecution = async () => {
    if (!executionSteps.length || isExecuting) return
    if (!isWalletConnected || !walletAddress) {
      displayToast("warning", "Please connect your wallet first.")
      return
    }

    setIsExecuting(true)
    abortRef.current = false

    try {
      // Create activity record only if no activityId provided (new execution)
      if (!activityId) {
        const activity = await createActivity({
          userAddress: walletAddress,
          strategyId,
          initialCapital: String(strategy.initialCapital?.amount || 0),
          totalSteps: executionSteps.length,
          currentStep: 1,
        })
        setActivityId(activity?.id || null)
        console.log("✅ New activity created:", activity?.id)
      } else {
        console.log("✅ Re-executing with existing activity:", activityId)
      }

      // Execute steps sequentially
      for (let i = startFromStep; i < strategy.steps.length; i++) {
        if (abortRef.current) break

        setCurrentStepIndex(i)
        console.log(`\n📍 Executing step ${i + 1}/${strategy.steps.length}`)

        // Update activity progress when moving to this step
        await syncActivityProgress(i, 'completed')

        try {
          const result = await executeStep(i, strategy.steps[i])
          
          // Check if this is the last step
          const isLastStep = i === strategy.steps.length - 1
          
          if (isLastStep) {
            // Mark all steps as completed
            setAllStepsCompleted(true)
            displayToast("success", "🎉 All steps completed successfully!")
            console.log("✅ All steps completed!")
          } else {
            // Delay between steps (except last step)
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        } catch (err) {
          console.error(`❌ Step ${i + 1} failed:`, err)
          updateStepStatus(i, "failed")
          await syncActivityProgress(i, 'failed')
          displayToast("error", `Step ${i + 1} failed: ${err instanceof Error ? err.message : String(err)}`)
          break
        }
      }
    } catch (err) {
      console.error("❌ Execution error:", err)
      displayToast("error", `Execution failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsExecuting(false)
      console.log("✅ Execution finished")
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
          <DialogTitle className="text-2xl font-bold text-primary">
            {allStepsCompleted ? "Execution Completed! 🎉" : "Execute Strategy"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1.5">
            {allStepsCompleted 
              ? `All ${executionSteps.length} steps completed successfully!`
              : `${subtitle} • Step ${currentStepIndex + 1} of ${executionSteps.length}`
            }
          </p>
        </DialogHeader>
        
        <div className="flex-1">
          {executionSteps.length > 0 ? (
            
            <StepStack
              steps={executionSteps}
              currentStep={currentStepIndex}
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

        {allStepsCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-6 p-4 rounded-xl bg-accent/10 border border-accent/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-accent-light">Success!</p>
                <p className="text-xs text-foreground/70">Your strategy has been executed successfully.</p>
              </div>
            </div>
          </motion.div>
        )}

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
              {!allStepsCompleted && (
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold"
                  onClick={startExecution}
                  disabled={!executionSteps.length || !isWalletConnected}
                >
                  {!isWalletConnected ? 'Connect Wallet' : 'Start Execution'}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}