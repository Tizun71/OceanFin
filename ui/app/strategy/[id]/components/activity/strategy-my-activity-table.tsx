"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { getActivities, restartActivity, resumeProgress } from "@/services/progress-service"
import { CommonTable, TableColumn } from "@/app/common/common-table"
import { simulateStrategy } from "@/services/strategy-service"
import type { StrategySimulate } from "@/types/strategy.type"
import { AnimatePresence, motion } from "framer-motion"
import { displayToast } from "@/components/shared/toast-manager"

const ExecutionModal = dynamic(() => import("@/components/shared/execution-modal").then((m) => m.ExecutionModal), {
  ssr: false,
})

export type MyActivityRow = {
  id: string
  date: string
  strategy: string
  strategyId: string
  currentStep: number
  totalSteps: number
  apr: string
  fee: string
  initialCapital: string
  status: "Pending" | "Completed" | "Failed"
  txHash?: string[]
  userAddress?: string
}

export const MyActivityTable = () => {
  const [activities, setActivities] = useState<MyActivityRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reExecuting, setReExecuting] = useState<string | null>(null)
  const [executionModalOpen, setExecutionModalOpen] = useState(false)
  const [simulateResult, setSimulateResult] = useState<StrategySimulate | null>(null)
  const [simulateError, setSimulateError] = useState<string | null>(null)
  const [startFromStep, setStartFromStep] = useState<number>(0)

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await getActivities()
      const list: any[] = Array.isArray(res) ? res : [res]
      const formatted: MyActivityRow[] = list.map((a) => ({
        id: a.id ?? "-",
        date: a.createdAt?.slice(0, 10) ?? "-",
        strategy: a.strategyId ?? "-",
        strategyId: a.strategyId ?? "-",
        currentStep: a.currentStep ?? 0,
        totalSteps: a.totalSteps ?? 0,
        apr: a.metadata?.APR ?? "-",
        fee: a.metadata?.fee ?? "-",
        initialCapital: a.metadata?.initial_capital ?? "-",
        status:
          a.status === "FAILED"
            ? "Failed"
            : a.status === "COMPLETED"
            ? "Completed"
            : "Pending",
        txHash: a.txHash ?? [],
        userAddress: a.userAddress ?? "-",
      }))
      setActivities(formatted)
    } catch (err) {
      console.error(err)
      setError("Failed to load activities.")
      displayToast("error", "Failed to load activities.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleRetry = async (id: string, step: number) => {
    try {
      await restartActivity(id, step)
      displayToast("success", `Retry step ${step} successfully!`)
      fetchActivities()
    } catch (error: any) {
      console.error("❌ Retry failed:", error)
      displayToast("error", error?.message || "Retry failed. Please try again.")
    }
  }

  const handleReExecute = async (row: MyActivityRow) => {
    setReExecuting(row.id)
    setSimulateError(null)
    
    try {
      const amount = parseFloat(row.initialCapital)
      if (!amount || amount <= 0) {
        throw new Error("Invalid initial capital amount")
      }

      const strategyData = { id: row.strategyId }
      
      const simulationResult = await simulateStrategy(strategyData, amount)
      console.log("✅ Simulation successful:", simulationResult)
      
      if (!simulationResult?.steps?.length) {
        console.warn("⚠️ No steps in simulation result")
      }
      
      const resumeFromStep = Math.max(0, row.currentStep - 1)
      console.log(`🔄 Resuming from step ${resumeFromStep} (current: ${row.currentStep}, total: ${row.totalSteps})`)
      
      setStartFromStep(resumeFromStep)
      setSimulateResult(simulationResult)
      setExecutionModalOpen(true)
      displayToast("success", "Simulation loaded successfully! Ready to re-execute.")
      
    } catch (error: any) {
      console.error("❌ Re-execute error:", error)
      const errorMsg = error?.message || "Re-execution failed"
      setError(errorMsg)
      setSimulateError(errorMsg)
      displayToast("error", errorMsg)
    } finally {
      setReExecuting(null)
    }
  }

  const columns: TableColumn<MyActivityRow>[] = [
    { key: "date", label: "Date" },
    { key: "strategy", label: "Strategy ID" },
    {
      key: "progress",
      label: "Progress",
      render: (r) => `Step ${r.currentStep}/${r.totalSteps}`,
    },
    { key: "apr", label: "APR" },
    { key: "fee", label: "Fee" },
    { key: "initialCapital", label: "Amount" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            r.status === "Pending"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : r.status === "Completed"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (r) => (
        <div className="flex gap-2">
          {r.status === "Failed" && (
            <button
              onClick={() => handleRetry(r.id, r.currentStep)}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 rounded-lg transition-all font-medium text-xs"
            >
              🔁 Retry
            </button>
          )}
          {r.status === "Pending" && (
            <button
              onClick={() => handleReExecute(r)}
              disabled={reExecuting === r.id}
              className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent/50 rounded-lg transition-all font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reExecuting === r.id ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                  Re-executing...
                </span>
              ) : (
                "▶ Re-execute"
              )}
            </button>
          )}
        </div>
      ),
    },
  ]

  const renderExpand = (row: MyActivityRow) => (
    <div className="grid grid-cols-2 gap-8 text-sm text-card-foreground">
      <div>
        <div className="text-muted-foreground text-xs uppercase mb-2 font-semibold">Wallet Address</div>
        <div className="font-medium truncate bg-accent/10 px-3 py-2 rounded border border-accent/20">
          {row.userAddress || "-"}
        </div>
      </div>

      <div>
        <div className="text-muted-foreground text-xs uppercase mb-2 font-semibold">Tx Hash</div>
        {row.txHash?.length ? (
          <TxHashList hashes={row.txHash} />
        ) : (
          <span className="text-muted-foreground italic text-sm">No transactions</span>
        )}
      </div>
    </div>
  )

  return (
    <>
      <CommonTable
        data={activities}
        columns={columns}
        expandable={renderExpand}
        loading={loading}
        error={error}
      />

      {simulateError && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {simulateError}
        </div>
      )}

      {simulateResult && (
        <ExecutionModal 
          open={executionModalOpen} 
          onOpenChange={setExecutionModalOpen} 
          strategy={simulateResult}
          startFromStep={startFromStep}
        />
      )}
    </>
  )
  
}
const TxHashList = ({ hashes }: { hashes: string[] }) => {
  const [showAll, setShowAll] = useState(false)
  const limit = 3
  const sorted = [...hashes].reverse()
  const visible = showAll ? sorted : sorted.slice(0, limit)

  return (
    <div>
      <AnimatePresence>
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-1 overflow-hidden"
        >
          {visible.map((hash, i) => (
            <a
              key={i}
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary hover:text-accent transition-colors text-sm font-medium bg-primary/10 px-3 py-2 rounded border border-primary/20 hover:border-primary/40 truncate"
            >
              {hash.slice(0, 8)}...{hash.slice(-6)} ↗
            </a>
          ))}
        </motion.div>
      </AnimatePresence>

      {hashes.length > limit && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs text-blue-500 hover:underline font-medium"
        >
          {showAll ? "Show less" : `Show ${hashes.length - limit} more`}
        </button>
      )}
    </div>
  )
}
