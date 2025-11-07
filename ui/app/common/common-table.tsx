"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface CommonTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  expandable?: (row: T) => React.ReactNode
  loading?: boolean
  error?: string | null
  gridCols?: string 
}

export function CommonTable<T extends { id: string }>({
  data,
  columns,
  expandable,
  loading,
  error,
  gridCols = "grid-cols-8",
}: CommonTableProps<T>) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  if (loading) return <div className="text-center py-4 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>

  return (
    <div className="space-y-3">
      {/* Header */}
      <div
        className={`grid ${gridCols} items-center bg-gray-100 text-gray-700 text-sm font-semibold px-6 py-3 rounded-t-lg border border-gray-200`}
      >
        {columns.map((col) => (
          <div key={String(col.key)} className={col.className}>
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((row) => (
        <div
          key={row.id}
          className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
        >
          {/* Main row */}
          <div className={`relative grid ${gridCols} items-center text-sm px-6 py-3 pr-12`}>
            {columns.map((col) => (
              <div key={String(col.key)} className={col.className}>
                {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
              </div>
            ))}

            {expandable && (
              <button
                onClick={() => toggleExpand(row.id)}
                className={`absolute top-1/2 right-5 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-transform duration-300 ${
                  expanded === row.id ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown size={18} />
              </button>
            )}
          </div>

          {/* Expanded content */}
          <AnimatePresence initial={false}>
            {expandable && expanded === row.id && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0.8 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ originY: 0 }}
                className="bg-gray-50 border-t border-gray-200 px-14 py-5 text-sm"
              >
                {expandable(row)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
