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
  gridCols = "grid-cols-5",
}: CommonTableProps<T>) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  if (loading) return <div className="text-center py-4 text-muted-foreground">Loading...</div>
  if (error) return <div className="text-center py-4 text-destructive">{error}</div>

  return (
    <div className="space-y-3">
      <div
        className={`grid ${gridCols} items-center bg-card/50 text-foreground text-sm font-semibold px-6 py-3 rounded-t-lg border border-border backdrop-blur-sm`}
      >
        {columns.map((col) => (
          <div key={String(col.key)} className={col.className}>
            {col.label}
          </div>
        ))}
      </div>

      {data.map((row) => (
        <div
          key={row.id}
          className="border border-border rounded-lg bg-card shadow-lg overflow-hidden hover:border-accent/50 transition-all duration-300"
        >
          <div className={`relative grid ${gridCols} items-center text-sm text-card-foreground px-6 py-3 pr-12`}>
            {columns.map((col) => (
              <div key={String(col.key)} className={col.className}>
                {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
              </div>
            ))}

            {expandable && (
              <button
                onClick={() => toggleExpand(row.id)}
                className={`absolute top-1/2 right-5 -translate-y-1/2 text-muted-foreground hover:text-primary transition-all duration-300 ${
                  expanded === row.id ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown size={18} />
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {expandable && expanded === row.id && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0.8 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ originY: 0 }}
                className="bg-card/30 border-t border-border px-14 py-5 text-sm backdrop-blur-sm"
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
