"use client"

import React, { useEffect, useState } from "react"
import { getActivities } from "@/services/progress-service"
import { CommonTable, TableColumn } from "@/app/common/common-table"

export type AllActivityRow = {
  id: string
  date: string
  user: string
  step: string
  apr: string
  fee: string
  initialCapital: string
  status: "Pending" | "Completed" | "Failed"
  txHash?: string[]
}

export const AllActivityTable = () => {
  const [data, setData] = useState<AllActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getActivities()
        const list = Array.isArray(res) ? res : res ? [res] : []

        const formatted: AllActivityRow[] = list.map((item: any) => ({
          id: item.id,
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-CA") 
            : "-",
          user: item.userAddress || "Unknown",
          step: `Step ${item.currentStep ?? 0} / ${item.totalSteps ?? 0}`,
          apr: item.metadata?.APR ?? "-",
          fee: item.metadata?.fee ?? "-",
          initialCapital: item.metadata?.initial_capital
            ? `$${item.metadata.initial_capital}`
            : "-",
          status:
            item.status === "FAILED"
              ? "Failed"
              : item.status === "COMPLETED"
              ? "Completed"
              : "Pending",
          txHash: item.txHash || [],
        }))

        setData(formatted)
      } catch (err) {
        console.error("Fetch activities failed:", err)
        setError("Failed to load activities.")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const columns: TableColumn<AllActivityRow>[] = [
    { key: "date", label: "Date", className: "col-span-1" },
    { key: "user", label: "User Address", className: "col-span-2 truncate" },
    { key: "step", label: "Progress", className: "col-span-2" },
    { key: "apr", label: "APR", className: "col-span-1" },
    { key: "fee", label: "Fee", className: "col-span-1" },
    { key: "initialCapital", label: "Amount", className: "col-span-1" },
    {
      key: "status",
      label: "Status",
      className: "col-span-1 text-center",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === "Pending"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : row.status === "Completed"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ]

  const renderExpand = (row: AllActivityRow) => (
    <div className="space-y-3">
      <div className="text-muted-foreground text-xs uppercase tracking-wide mb-2 font-semibold">
        Transaction Hash
      </div>

      {row.txHash && row.txHash.length > 0 ? (
        <div className="flex flex-col gap-2">
          {row.txHash.map((hash) => (
            <a
              key={hash}
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent transition-colors text-sm font-medium bg-primary/10 px-3 py-2 rounded border border-primary/20 hover:border-primary/40 truncate"
            >
              {hash.slice(0, 10)}...{hash.slice(-8)} ↗
            </a>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic text-sm">No transactions</span>
      )}
    </div>
  )

  return (
    <div className="p-4">
      <CommonTable
        columns={columns}
        data={data}
        expandable={renderExpand}
        loading={loading}
        error={error}
        gridCols="grid-cols-9" 
      />
      {!loading && !error && data.length === 0 && (
        <div className="text-center text-muted-foreground py-6 text-sm italic">
          No activities found.
        </div>
      )}
    </div>
  )
}
