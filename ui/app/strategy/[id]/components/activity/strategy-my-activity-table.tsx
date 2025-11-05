"use client"

import { useEffect, useState } from "react"
import { Column, CommonTable } from "@/app/common/common-table"
import { getActivities, restartActivity, resumeProgress } from "@/services/progress-service"

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
}

export const MyActivityTable = () => {
  const [activities, setActivities] = useState<MyActivityRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getActivities()
      const list: any[] = Array.isArray(res) ? res : [res]

      const formatted: MyActivityRow[] = list.map((a) => ({
        id: a.id ?? "-",
        date: a.createdAt ? a.createdAt.slice(0, 10) : "-",
        strategy: a.strategyId || "-",
        currentStep: a.currentStep ?? 0,
        totalSteps: a.totalSteps ?? 0,
        apr: a.metadata?.APR ? `${a.metadata.APR}%` : "-",
        fee: a.metadata?.fee ? `${a.metadata.fee}%` : "-",
        initialCapital: a.metadata?.initial_capital || "-",
        status:
          a.status === "FAILED"
            ? "Failed"
            : a.status === "COMPLETED"
            ? "Completed"
            : "Pending",
      }))

      setActivities(formatted)
    } catch (err) {
      console.error(" Fetch activities failed:", err)
      setError("Failed to load activities.")
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
      alert(" Retry successful!")
      fetchActivities()
    } catch (err) {
      console.error(" Retry failed:", err)
      alert(" Retry failed. Check console for details.")
    }
  }

  const handleResume = async (id: string, step: number) => {
    try {
      const payload = {
        activityId: id,
        step,
        status: "IN_PROGRESS",
        message: "Resumed from frontend",
      }
      await resumeProgress(id, payload)
      alert(" Resume successful!")
      fetchActivities()
    } catch (err) {
      console.error(" Resume failed:", err)
      alert(" Resume failed. Check console for details.")
    }
  }

  const columns: Column<MyActivityRow>[] = [
    { key: "date", label: "Date" },
    { key: "strategy", label: "Strategy ID" },
    {
      key: "progress" as any,
      label: "Progress",
      render: (row) => (
        <span>
          Step {row.currentStep}/{row.totalSteps}
        </span>
      ),
    },
    { key: "apr", label: "APR" },
    { key: "fee", label: "Fee" },
    { key: "initialCapital", label: "Initial Capital" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === "Pending"
              ? "bg-yellow-100 text-yellow-600"
              : row.status === "Completed"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "action" as any,
      label: "Action",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "Failed" && (
            <button
              className="text-blue-600 hover:underline"
              onClick={() => handleRetry(row.id, row.currentStep)}
            >
              🔁 Retry
            </button>
          )}
          {row.status === "Pending" && (
            <button
              className="text-green-600 hover:underline"
              onClick={() => handleResume(row.id, row.currentStep)}
            >
              ▶ Resume
            </button>
          )}
        </div>
      ),
    },
  ]

  if (loading)
    return <div className="text-center py-4 text-gray-500">Loading activities...</div>

  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>

  return <CommonTable columns={columns} data={activities} />
}
