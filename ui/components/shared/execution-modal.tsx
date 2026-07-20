"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { StrategySimulate, Step as StrategyStep } from "@/types/strategy.type"
import type { ExecutionStatus, ExecutionStep } from "./types"
import { STEP_TYPE } from "@/utils/constant"
import { buildStepTx } from "@/services/strategy-step-service"
import { useLunoPapiClient } from "@/hooks/use-luno-papiclient"
import { useActiveChain } from "@/hooks/use-active-chain"
import { useWallet } from "@/hooks/use-wallet"
import { usePublicClient } from "wagmi"
import type { Address } from "viem"
import { resolveEvmStepPlan } from "@/lib/evm/build-evm-plan"
import { executeEvmStep } from "@/lib/evm/execute-evm-step"
import { CheckCircle2 } from "lucide-react"
import { displayToast } from "./toast-manager"
import StepStack from "./execution-step-stack"
import { resolveAssetIcon } from "@/lib/iconMap"
import type { UpdateActivityPayload } from "@/types/activity.interface"
import { useCreateActivity, useUpdateActivity } from "@/hooks/use-activity-service"

interface ExecutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategy: StrategySimulate
  strategyId: string
  startFromStep?: number
  activityId?: string | null
  onStatusChange?: (status: "cancelled" | "completed") => void
}

const formatAmt = (v?: number) => (typeof v === "number" ? Number(v.toFixed(6)) : "-")

const mapStatusToBackend = (status: 'completed' | 'failed' | 'pending'): 'SUCCESS' | 'FAILED' | 'PENDING' => {
  return status === 'completed' ? 'SUCCESS' : status === 'failed' ? 'FAILED' : 'PENDING'
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
    return []
  }
  
  return strategy.steps.map((s, i) => {
    const fromToken = s.tokenIn ? {
      icon: resolveAssetIcon(s.tokenIn.symbol) ?? "",
      symbol: s.tokenIn.symbol,
    } : undefined

    const toToken = s.tokenOut ? {
      icon: resolveAssetIcon(s.tokenOut.symbol) ?? "",
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

export function ExecutionModal({ 
  open, 
  onOpenChange, 
  strategy, 
  strategyId, 
  startFromStep = 0,
  activityId: initialActivityId = null,
  onStatusChange,
}: ExecutionModalProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activityId, setActivityId] = useState<string | null>(initialActivityId)
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)
  const abortRef = useRef(false)

  const { sendTransaction, walletAddress, isWalletConnected } = useLunoPapiClient()
  const { activeChain, isEvm } = useActiveChain()
  const evmWallet = useWallet()
  const publicClient = usePublicClient({ chainId: activeChain.chainId })

  // Chain-agnostic wallet view used across the execution flow.
  const activeAddress = isEvm ? evmWallet.address : walletAddress
  const walletConnected = isEvm ? evmWallet.isConnected : isWalletConnected

  const createActivityMutation = useCreateActivity()
  const updateActivityMutation = useUpdateActivity()

  useEffect(() => {
  if (!open) {
    setExecutionSteps([])
    setAllStepsCompleted(false)
    setCurrentStepIndex(0)
    return
  }

  const steps = buildExecutionSteps(strategy)
  const stepsWithStatus = steps.map((step, idx) => ({
    ...step,
    status: idx < startFromStep ? "completed" : "pending" as ExecutionStatus
  }))
  setExecutionSteps(stepsWithStatus)
  setIsExecuting(false)
  setAllStepsCompleted(false)
  setActivityId(initialActivityId)
  setCurrentStepIndex(startFromStep)
}, [open])


  const subtitle = useMemo(() => {
    const resumeText = startFromStep > 0 ? ` • Resuming from step ${startFromStep + 1}` : ""
    const modeText = initialActivityId ? " (Re-execute)" : " (New)"
    return strategy?.initialCapital
      ? `Initial: ${formatAmt(strategy.initialCapital.amount)} ${strategy.initialCapital.symbol} • Loops: ${strategy.loops}${resumeText}${modeText}`
      : `Loops: ${strategy?.loops ?? "-"}${resumeText}${modeText}`
  }, [strategy, startFromStep, initialActivityId])

  const updateStepStatus = (stepIndex: number, status: ExecutionStatus, txHash?: string) => {
    setExecutionSteps((prev) =>
      prev.map((s, idx) => 
        idx === stepIndex 
          ? { ...s, status, ...(txHash && { txHash }) } 
          : s
      )
    )
  }

  const syncActivityProgress = async (activityId: string, stepIndex: number, status: 'completed' | 'failed' | 'pending', txHash?: string | string[]) => {
    try {
      const txHashArray = txHash
      ? Array.isArray(txHash) ? txHash : [txHash]
      : undefined

      const payload: UpdateActivityPayload = {
        activityId,
        step: stepIndex,
        status: mapStatusToBackend(status),
        message: txHash 
          ? `Step ${stepIndex} ${status} with txHash: ${txHash}` 
          : `Step ${stepIndex} ${status}`,
          ...(txHashArray && { txHash: txHashArray })
      }
      
      await updateActivityMutation.mutateAsync({ activityId, payload })
    } catch (err) {
      displayToast("error", `Failed to sync activity progress: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const executeStep = async (stepIndex: number, step: StrategyStep) => {
    updateStepStatus(stepIndex, "processing")

    const isLast = stepIndex >= strategy.steps.length - 1

    // EVM path: build a plan and run the safe simulate→approve→write rail.
    if (isEvm) {
      if (!activeChain.chainId) throw new Error("Active chain has no chainId")
      if (!evmWallet.isConnected) throw new Error("Connect an EVM wallet first")
      // useWalletClient returns nothing while the wallet sits on another network,
      // which otherwise surfaces as a confusing "not ready".
      if (evmWallet.needsSwitch) {
        throw new Error(
          `Wallet is on chain ${evmWallet.walletChainId}; switch it to ${activeChain.name} (${activeChain.chainId}) to sign.`,
        )
      }

      const walletClient = evmWallet.getWalletClient()
      if (!walletClient) throw new Error(`No wallet client for ${activeChain.name}`)
      if (!publicClient) throw new Error(`No RPC client for ${activeChain.name}`)

      const plan = await resolveEvmStepPlan(
        step,
        activeChain,
        activeAddress as Address,
        publicClient,
      )
      if (!plan) {
        updateStepStatus(stepIndex, "completed")
        return { success: true, skipDelay: isLast }
      }

      const { txHash } = await executeEvmStep(plan, {
        publicClient,
        walletClient,
        account: activeAddress as Address,
        expectedChainId: activeChain.chainId,
      })

      updateStepStatus(stepIndex, "completed", txHash)
      displayToast("success", `Step ${stepIndex + 1} completed successfully.`)
      return { success: true, txHash, skipDelay: isLast }
    }

    // Substrate path (Hydration) — unchanged.
    await sleep(3000);
    const tx = await buildStepTx(step, walletAddress!)

    if (!tx) {
      updateStepStatus(stepIndex, "completed")
      return { success: true, skipDelay: stepIndex >= strategy.steps.length - 1 }
    }

    const result = await sendTransaction(tx)
    
    if (abortRef.current) throw new Error("Execution cancelled by user")
    if (result?.status === "failed" || result?.errorMessage) throw new Error(result?.errorMessage || "Transaction failed")
    if (!result?.transactionHash) throw new Error("No transaction hash returned")

    if (result.status === "success") {
    updateStepStatus(stepIndex, "completed", result.transactionHash)
    displayToast("success", `Step ${stepIndex + 1} completed successfully.`)
    }
    return { success: result.status === "success", txHash: result.transactionHash, skipDelay: stepIndex >= strategy.steps.length - 1 }
  }

  const startExecution = async () => {
    if (!executionSteps.length || isExecuting) return
    if (!walletConnected || !activeAddress) {
      displayToast("warning", "Please connect your wallet first.")
      return
    }

    setIsExecuting(true)
    abortRef.current = false

    try {
      let currentActivityId = activityId

      if (!currentActivityId) {
        const activity = await createActivityMutation.mutateAsync({
          userAddress: activeAddress,
          strategyId,
          initialCapital: String(strategy.initialCapital?.amount || 0),
          totalSteps: executionSteps.length,
          currentStep: 1,
        })
        currentActivityId = activity.id
        setActivityId(currentActivityId)
      }

      const fromStep = currentStepIndex
      for (let i = currentStepIndex; i < strategy.steps.length; i++) {
        if (abortRef.current) break

        setCurrentStepIndex(i)

        try {
          const result = await executeStep(i, strategy.steps[i])
          if (currentActivityId) await syncActivityProgress(currentActivityId, i + 1, 'completed', result.txHash)

          const isLastStep = i === strategy.steps.length - 1
          updateStepStatus(i, "completed", result.txHash)
          if (isLastStep) {
            setCurrentStepIndex(i + 1)
            setAllStepsCompleted(true)
            onStatusChange?.("completed")
            displayToast("success", "All steps completed.")
            if (currentActivityId) {
              await updateActivityMutation.mutateAsync({
                activityId: currentActivityId,
                payload: {
                  activityId: currentActivityId,
                  step: strategy.steps.length,
                  status: "SUCCESS",
                  message: `All ${strategy.steps.length} steps completed successfully.`,
                },
              })
            }
          } else {
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        } catch (err) {
          updateStepStatus(i, "failed")
          if (currentActivityId) await syncActivityProgress(currentActivityId, i + 1, 'pending')
          displayToast("error", `Step ${i + 1} failed: ${err instanceof Error ? err.message : String(err)}`)
          break
        }
      }
    } catch (err) {
      displayToast("error", `Execution failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCancel = () => {
    abortRef.current = true
    setIsExecuting(false)
    onStatusChange?.("cancelled")
    onOpenChange(false)
  }

  const handleClose = async () => {
    if (isExecuting || (currentStepIndex < executionSteps.length && !allStepsCompleted)) {
      abortRef.current = true
      setIsExecuting(false)
      updateStepStatus(currentStepIndex, "failed")
      if (activityId) {
        await syncActivityProgress(activityId, currentStepIndex + 1, 'failed')
      }
      onStatusChange?.("cancelled")
    }
    onOpenChange(false)
  }

  const completedCount = allStepsCompleted ? executionSteps.length : currentStepIndex
  const progressPct = executionSteps.length
    ? Math.round((completedCount / executionSteps.length) * 100)
    : 0

  return (
    <Dialog
      open={open}
      // Esc and overlay clicks used to abort a running transaction sequence
      // with no confirmation — one stray click mid-execution marked the current
      // step failed. While executing, dismissal must go through the explicit
      // Cancel button.
      onOpenChange={(next) => {
        if (!next && isExecuting) return
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="sm:max-w-lg max-h-[85dvh] flex flex-col gap-0 bg-popover backdrop-blur-xl shadow-lg rounded-xl border border-border"
        onInteractOutside={(e) => isExecuting && e.preventDefault()}
        onEscapeKeyDown={(e) => isExecuting && e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-b border-border">
          {/* Was `text-2xl` with a 🎉 and an exclamation mark. A confirmation
              dialog for signing transactions should read as calm and factual. */}
          <DialogTitle className="text-lg font-semibold text-foreground">
            {allStepsCompleted ? "Execution complete" : "Execute strategy"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {allStepsCompleted
              ? `All ${executionSteps.length} steps completed.`
              : `${subtitle} • Step ${Math.min(currentStepIndex + 1, executionSteps.length)} of ${executionSteps.length}`}
          </p>

          {/* Progress was only ever stated in text. A bar gives the "how much
              is left" read at a glance during a multi-minute signing flow. */}
          {executionSteps.length > 0 && (
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={executionSteps.length}
              aria-label="Execution progress"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                  allStepsCompleted ? "bg-success" : "bg-accent"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </DialogHeader>

        {/* Screen readers got no notification as steps advanced. */}
        <p className="sr-only" role="status" aria-live="polite">
          {allStepsCompleted
            ? "All steps completed"
            : isExecuting
              ? `Executing step ${currentStepIndex + 1} of ${executionSteps.length}`
              : ""}
        </p>

        <div className="flex-1 min-h-0 py-4">
          {executionSteps.length > 0 ? (
            <StepStack
              steps={executionSteps}
              currentStep={currentStepIndex}
              allStepsCompleted={allStepsCompleted}
              explorerUrl={activeChain?.explorerUrl}
              isEvm={isEvm}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              This strategy has no steps to execute.
            </p>
          )}
        </div>

        {allStepsCompleted && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-success" aria-hidden />
            <p className="text-sm text-foreground">
              Your strategy is now running. Track it under{" "}
              <span className="font-medium">My activities</span>.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border">
          {isExecuting ? (
            // Was `bg-red-600` hardcoded with a red glow and hover:scale-105.
            // Cancelling is a secondary, cautionary action — not the loudest
            // thing on screen.
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              Cancel execution
            </Button>
          ) : (
            <>
              <Button
                variant={allStepsCompleted ? "default" : "secondary"}
                className="flex-1"
                onClick={handleClose}
              >
                {allStepsCompleted ? "Done" : "Close"}
              </Button>
              {!allStepsCompleted && (
                <Button
                  className="flex-1"
                  onClick={startExecution}
                  disabled={!executionSteps.length || !walletConnected}
                >
                  {!walletConnected ? "Connect wallet" : "Start execution"}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
