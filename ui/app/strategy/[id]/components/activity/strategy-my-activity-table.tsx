"use client"

import { useEffect, useState } from "react"
import { getActivities, restartActivity, resumeProgress } from "@/services/progress-service"
import { CommonTable, TableColumn } from "@/app/common/common-table"

export type MyActivityRow = {
  id: string
  date: string
  strategy: string
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

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await getActivities()
      const list: any[] = Array.isArray(res) ? res : [res]
      const formatted: MyActivityRow[] = list.map((a) => ({
        id: a.id ?? "-",
        date: a.createdAt?.slice(0, 10) ?? "-",
        strategy: a.strategyId ?? "-",
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleRetry = async (id: string, step: number) => {
    await restartActivity(id, step)
    fetchActivities()
  }

  const handleResume = async (id: string, step: number) => {
    await resumeProgress(id, { activityId: id, step })
    fetchActivities()
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
              ? "bg-yellow-100 text-yellow-600"
              : r.status === "Completed"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
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
              className="text-blue-600 hover:underline"
            >
              🔁 Retry
            </button>
          )}
          {r.status === "Pending" && (
            <button
              onClick={() => handleResume(r.id, r.currentStep)}
              className="text-green-600 hover:underline"
            >
              ▶ Resume
            </button>
          )}
        </div>
      ),
    },
  ]

  //expand (TxHash + Address)
  const renderExpand = (row: MyActivityRow) => (
    <div className="grid grid-cols-2 gap-8 text-[15px] text-gray-800">
      <div>
        <div className="text-gray-500 text-xs uppercase mb-1">Wallet Address</div>
        <div className="font-medium truncate">{row.userAddress || "-"}</div>
      </div>

      <div>
        <div className="text-gray-500 text-xs uppercase mb-1">Tx Hash</div>
        {row.txHash?.length ? (
          row.txHash.map((hash, i) => (
            <a
              key={i}
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline text-sm"
            >
              {hash.slice(0, 8)}...{hash.slice(-6)} ↗
            </a>
          ))
        ) : (
          <span className="text-gray-400 italic">No transactions</span>
        )}
      </div>
    </div>
  )

  return (
    <CommonTable
      data={activities}
      columns={columns}
      expandable={renderExpand}
      loading={loading}
      error={error}
    />
  )
}
