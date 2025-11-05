"use client"

import React, { useEffect, useState } from "react"
import { Column, CommonTable } from "@/app/common/common-table"
import { getActivities } from "@/services/progress-service"

export type AllActivityRow = {
  id: string
  date: string
  user: string
  step: string
  apr: string
  fee: string
  initialCapital: string
  status: "Pending" | "Completed" | "Failed"
}

export const AllActivityTable = () => {
  const [data, setData] = useState<AllActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const res = await getActivities()

        const list = Array.isArray(res) ? res : [res]

        const formatted: AllActivityRow[] = list.map((item: any) => ({
          id: item.id,
          date: new Date(item.createdAt).toISOString().split("T")[0],
          user: item.userAddress || "Unknown",
          step: `Step ${item.currentStep ?? 0} / ${item.totalSteps ?? 0}`,
          apr: item.metadata?.APR ? `${item.metadata.APR}%` : "-", 
          fee: item.metadata?.fee ? `${item.metadata.fee}%` : "-", 
          initialCapital: item.metadata?.initial_capital
            ? `$${item.metadata.initial_capital}`
            : "-",
          status:
            item.status === "FAILED"
              ? "Failed"
              : item.status === "COMPLETED"
              ? "Completed"
              : "Pending",
        }))

        console.log(" Fetched activities:", formatted) 

        setData(formatted)
      } catch (err) {
        console.error(" Fetch activities failed:", err)
        setError("Failed to load activities.")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const columns: Column<AllActivityRow>[] = [
    { key: "date", label: "Date" },
    { key: "user", label: "User Address" },
    { key: "step", label: "Progress" },
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
  ]

  if (loading) return <div className="p-4 text-gray-500">Loading activities...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return <CommonTable columns={columns} data={data} />
}
