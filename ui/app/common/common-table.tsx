"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, ChevronDown } from "lucide-react"

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
  /** Shown when the request succeeded but returned nothing. */
  emptyMessage?: string
  onRetry?: () => void
}

export function CommonTable<T extends { id: string }>({
  data,
  columns,
  expandable,
  loading,
  error,
  gridCols = "grid-cols-5",
  emptyMessage = "Nothing to show yet.",
  onRetry,
}: CommonTableProps<T>) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  const header = (
    <div
      role="row"
      className={`grid ${gridCols} items-center bg-surface-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-t-lg border border-border backdrop-blur-sm`}
    >
      {columns.map((col) => (
        <div role="columnheader" key={String(col.key)} className={col.className}>
          {col.label}
        </div>
      ))}
    </div>
  )

  // Skeleton rows keep the header and row rhythm in place, so content lands
  // without the layout shift a centred spinner guarantees.
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        {header}
        <span className="sr-only">Loading results</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`grid ${gridCols} items-center gap-4 border border-border rounded-lg bg-card px-6 py-4`}
          >
            {columns.map((col) => (
              <div key={String(col.key)} className="skeleton h-4 w-3/4" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Errors were a bare red string with no way to recover.
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-10 text-center"
      >
        <AlertCircle className="w-6 h-6 text-destructive" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-foreground">We couldn&apos;t load this data</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-2 rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  return (
    // Grid rows can't be a real <table>, but the ARIA roles give screen readers
    // the row/cell structure the visual layout implies.
    <div role="table" className="space-y-3">
      {header}

      {data.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}

      {data.map((row) => {
        const isOpen = expanded === row.id
        return (
          <div
            key={row.id}
            className="border border-border rounded-lg bg-card shadow-sm overflow-hidden transition-colors duration-200 hover:border-accent/40"
          >
            <div
              role="row"
              className={`relative grid ${gridCols} items-center text-sm text-card-foreground px-6 py-3 pr-12`}
            >
              {columns.map((col) => (
                <div role="cell" key={String(col.key)} className={col.className}>
                  {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
                </div>
              ))}

              {expandable && (
                <button
                  type="button"
                  onClick={() => toggleExpand(row.id)}
                  aria-expanded={isOpen}
                  aria-controls={`row-detail-${row.id}`}
                  // Icon-only control had no accessible name and a 18px hit area.
                  aria-label={isOpen ? "Hide details" : "Show details"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 grid place-items-center size-8 rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {expandable && isOpen && (
                <motion.div
                  id={`row-detail-${row.id}`}
                  // Animating height instead of scaleY stops the nested content
                  // from being squashed and re-stretched during the transition.
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden bg-surface-1 border-t border-border text-sm"
                >
                  <div className="px-6 md:px-14 py-5">{expandable(row)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
