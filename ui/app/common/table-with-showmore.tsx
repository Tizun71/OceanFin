"use client"

import { useState } from "react"
import { CommonTable, TableColumn } from "./common-table"

interface TableWithShowMoreProps<T extends { id: string }> {
  data: T[]
  columns: TableColumn<T>[]
  expandable?: (row: T) => React.ReactNode
  loading?: boolean
  error?: string | null
  gridCols?: string
  limit?: number
}

export function TableWithShowMore<T extends { id: string }>({
  data,
  columns,
  expandable,
  loading,
  error,
  gridCols,
  limit = 5,
}: TableWithShowMoreProps<T>) {
  const [showAll, setShowAll] = useState(false)
  const visibleData = showAll ? data : data.slice(0, limit)

  return (
    <div className="space-y-4">
      <CommonTable
        data={visibleData}
        columns={columns}
        expandable={expandable}
        loading={loading}
        error={error}
        gridCols={gridCols}
      />

      {data.length > limit && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-500 hover:underline font-medium"
          >
            {showAll ? "Show less" : `Show ${data.length - limit} more`}
          </button>
        </div>
      )}
    </div>
  )
}
