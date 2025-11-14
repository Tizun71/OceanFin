"use client"

import React, { useMemo, useState } from "react"
import { useLuno } from "@/app/contexts/luno-context"
import { CommonTable, TableColumn } from "@/app/common/common-table"
import { usePaginatedActivities } from "@/hooks/use-paginated-activities"
import Pagination from "@/components/shared/pagination"
import { AnimatePresence, motion } from "framer-motion"

const ETHERSCAN_TX_BASE = "https://hydration.subscan.io/extrinsic/"

export type AllActivityRow = {
  id: string
  date: string
  user: string
  step: string
  apr: string
  fee: string
  initialCapital: string
  status: "Pending" | "Completed"
  txHash?: string[]
}

function mapActivityToRow(a: any): AllActivityRow {
  return {
    id: a.id ?? "-",
    date: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-CA") : "-",
    user: a.userAddress || "Unknown",
    step: `Step ${a.currentStep ?? 0} / ${a.totalSteps ?? 0}`,
    apr: a.metadata?.APR ?? "-",
    fee: a.metadata?.fee ?? "-",
    initialCapital: a.metadata?.initial_capital ? `${a.metadata.initial_capital}` : "-",
    status: a.status === "SUCCESS" ? "Completed" : "Pending",
    txHash: a.txHash || [],
  }
}

export const AllActivityTable: React.FC = () => {
  const { address } = useLuno()
  const [page, setPage] = useState<number>(1)
  const limit = 10

  const { activities: activitiesData, total, loading, error } = usePaginatedActivities({
    page,
    limit,
    userAddress: address,
  })

  const totalPages = total && total > 0 ? Math.ceil(total / limit) : 1

  const rows = useMemo(() => (activitiesData || []).map(mapActivityToRow), [activitiesData])

  const columns: TableColumn<AllActivityRow>[] = useMemo(
    () => [
      { key: "date", label: "Date", className: "text-left" },
      {
        key: "user",
        label: "User Address",
        className: "text-left",
        render: (row) =>
          row.user.length > 14 ? `${row.user.slice(0, 8)}...${row.user.slice(-6)}` : row.user,
      },
      { key: "initialCapital", label: "Amount", className: "text-left" },
      { key: "step", label: "Progress", className: "text-left" },
      {
        key: "status",
        label: "Status",
        className: "text-center",
        render: (row) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              row.status === "Pending"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-green-500/20 text-green-400 border border-green-500/30"
            }`}
          >
            {row.status}
          </span>
        ),
      },
    ],
    []
  )

  const renderExpand = (row: AllActivityRow) => (
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
    <div className="p-4">
      <CommonTable
        columns={columns}
        data={rows}
        expandable={renderExpand}
        loading={loading}
        error={error}
        gridCols="grid-cols-5"
      />
      {!loading && !error && rows.length === 0 && (
        <div className="text-center text-muted-foreground py-6 text-sm italic">
          No activities found.
        </div>
      )}

      <Pagination
        page={page}
        totalPages={Math.max(1, totalPages)}
        onPageChange={(newPage) => setPage(newPage)} 
      />
    </div>
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
