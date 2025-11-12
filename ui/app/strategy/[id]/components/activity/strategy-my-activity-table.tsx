"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { simulateStrategy } from "@/services/strategy-service"
import type { StrategySimulate } from "@/types/strategy.type"
import { AnimatePresence, motion } from "framer-motion"
import { displayToast } from "@/components/shared/toast-manager"
import { ActivityResponse } from "@/types/activity.interface"
import { useLuno } from "@/app/contexts/luno-context"
import { useActivities } from "@/hooks/use-activity-service"
import { CommonTable, TableColumn } from "@/app/common/common-table"
import { TableWithShowMore } from "@/app/common/table-with-showmore"

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
  const { address } = useLuno()
  
  const { data: activitiesData, isLoading: loading, error: queryError } = useActivities({ 
    userAddress: address 
  })

  const [reExecuting, setReExecuting] = useState<string | null>(null)
  const [executionModalOpen, setExecutionModalOpen] = useState(false)
  const [simulateResult, setSimulateResult] = useState<StrategySimulate | null>(null)
  const [simulateError, setSimulateError] = useState<string | null>(null)
  const [startFromStep, setStartFromStep] = useState<number>(0)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("")

  const activities = useMemo(() => {
    const list = Array.isArray(activitiesData) ? activitiesData : activitiesData ? [activitiesData] : []
    return list.map((a): MyActivityRow => ({
      id: a.id ?? "-",
      date: a.createdAt?.slice(0, 10) ?? "-",
      strategy: a.strategyId ?? "-",
      strategyId: a.strategyId ?? "-",
      currentStep: a.currentStep ?? 0,
      totalSteps: a.totalSteps ?? 0,
      apr: a.metadata?.APR ?? "-",
      fee: a.metadata?.fee ?? "-",
      initialCapital: a.metadata?.initial_capital ?? "-",
      status: a.status === "SUCCESS" ? "Completed" : "Pending",
      txHash: a.txHash ?? [],
      userAddress: a.userAddress ?? "-",
    }))
  }, [activitiesData])

  const error = queryError ? "Failed to load activities." : null

  const handleReExecute = async (row: MyActivityRow) => {
    setReExecuting(row.id)
    setSimulateError(null)

    try {
      const amount = Number(row.initialCapital.toString().replace(/,/g, ""))
      if (!amount || amount <= 0) {
        throw new Error("Invalid initial capital amount")
      }

      const strategyData = { id: row.strategyId }

      const simulationResult = await simulateStrategy(strategyData, amount)

      if (!simulationResult?.steps?.length) {
        throw new Error("No steps in simulation result")
      }

      const resumeFromStep = Math.max(0, row.currentStep - 1)

      setStartFromStep(resumeFromStep)
      setSimulateResult(simulationResult)
      setSelectedActivityId(row.id)
      setSelectedStrategyId(row.strategyId)
      setExecutionModalOpen(true)
      displayToast("success", "Simulation loaded successfully! Ready to re-execute.")

    } catch (error: any) {
      displayToast("error", error?.message || "Re-execution failed.")
    } finally {
      setReExecuting(null)
    }
  }

  useEffect(() => {
    if (!executionModalOpen) {
      setSimulateResult(null)
      setSelectedActivityId(null)
      setSelectedStrategyId("")
    }
  }, [executionModalOpen])

  const columns: TableColumn<MyActivityRow>[] = [
    { key: "date", label: "Date" },
    { key: "initialCapital", label: "Amount" },
    {
      key: "progress",
      label: "Progress",
      render: (r) => `Step ${r.currentStep}/${r.totalSteps}`,
    },
    
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            r.status === "Pending"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-green-500/20 text-green-400 border border-green-500/30"
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
    <div className="space-y-3 text-sm text-card-foreground">
      <div className="text-muted-foreground text-xs uppercase mb-2 font-semibold">
        Transaction Hash
      </div>
      {row.txHash?.length ? (
        <TxHashList hashes={row.txHash} />
      ) : (
        <span className="text-muted-foreground italic text-sm">No transactions</span>
      )}
    </div>
  )

  return (
    <>
      <TableWithShowMore
        data={activities}
        columns={columns}
        expandable={renderExpand}
        loading={loading}
        error={error}
      />
      {!loading && !error && activities.length === 0 && (
        <div className="text-center text-muted-foreground py-6 text-sm italic">
          No activity records found.
        </div>
      )}

      {simulateResult && (
        <ExecutionModal
          open={executionModalOpen}
          onOpenChange={setExecutionModalOpen}
          strategy={simulateResult}
          strategyId={selectedStrategyId}
          startFromStep={startFromStep}
          activityId={selectedActivityId}
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
          {visible.map((hash) => (
            <a
              key={hash}
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
