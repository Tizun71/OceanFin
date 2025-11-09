"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useParams } from "next/navigation"
import { getActivities } from "@/services/activity-service"
import { CommonTable, TableColumn } from "@/app/common/common-table"
import { ActivityResponse } from "@/types/activity.interface"

const ETHERSCAN_TX_BASE = "https://hydration.subscan.io/extrinsic/"

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

function mapActivityToRow(a: ActivityResponse): AllActivityRow {
  return {
    id: a.id ?? "-",
    date: a.createdAt
      ? new Date(a.createdAt).toLocaleDateString("en-CA")
      : "-",
    user: a.userAddress || "Unknown",
    step: `Step ${a.currentStep ?? 0} / ${a.totalSteps ?? 0}`,
    apr: a.metadata?.APR ?? "-",
    fee: a.metadata?.fee ?? "-",
    initialCapital: a.metadata?.initial_capital
      ? `$${a.metadata.initial_capital}`
      : "-",
    status:
      a.status === "FAILED"
        ? "Failed"
        : a.status === "COMPLETED"
        ? "Completed"
        : "Pending",
    txHash: a.txHash || [],
  }
}

export const AllActivityTable: React.FC = () => {
  const params = useParams<{ id: string | string[] }>()
  const rawId = params?.id

  const strategyId = useMemo(() => {
    const val = Array.isArray(rawId) ? rawId[0] : (rawId || "")
    try {
      return decodeURIComponent(val)
    } catch {
      return val
    }
  }, [rawId])

  const [rows, setRows] = useState<AllActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchActivities = useCallback(async () => {
    if (!strategyId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await getActivities({ strategyId }, { signal: controller.signal })
      if (controller.signal.aborted) return
      const list = Array.isArray(res) ? res : res ? [res] : []
      setRows(list.map(mapActivityToRow))
    } catch (err) {
      if (controller.signal.aborted) return
      console.error("Fetch activities failed:", err)
      setError("Failed to load activities.")
      setRows([])
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [strategyId])

  useEffect(() => {
    fetchActivities()
    return () => abortRef.current?.abort()
  }, [fetchActivities])

  const columns: TableColumn<AllActivityRow>[] = useMemo(
    () => [
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
    ],
    []
  )

  const renderExpand = useCallback(
    (row: AllActivityRow) => (
      <div className="space-y-3">
        <div className="text-muted-foreground text-xs uppercase tracking-wide mb-2 font-semibold">
          Transaction Hash
        </div>
        {row.txHash && row.txHash.length > 0 ? (
          <div className="flex flex-col gap-2">
            {row.txHash.map((hash) => (
              <a
                key={hash}
                href={`${ETHERSCAN_TX_BASE}/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent transition-colors text-sm font-medium bg-primary/10 px-3 py-2 rounded border border-primary/20 hover:border-primary/40 truncate"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)} ↗
              </a>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">
            No transactions
          </span>
        )}
      </div>
    ),
    []
  )

  return (
    <div className="p-4">
      <CommonTable
        columns={columns}
        data={rows}
        expandable={renderExpand}
        loading={loading}
        error={error}
        gridCols="grid-cols-9"
      />
      {!loading && !error && rows.length === 0 && (
        <div className="text-center text-muted-foreground py-6 text-sm italic">
          No activities found.
        </div>
      )}
    </div>
  )
}
