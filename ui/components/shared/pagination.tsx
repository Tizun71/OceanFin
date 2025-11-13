import React from "react"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const start = Math.max(1, page - delta)
    const end = Math.min(totalPages, page + delta)
    const pages = []

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push("ellipsis-start")
    }

    for (let i = start; i <= end; i++) pages.push(i)

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("ellipsis-end")
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 mt-6 ${className || ""}`}>
      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-transparent text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        ←
      </button>

      {/* First */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(1)}
        className="px-3 py-1 border border-gray-300 rounded-md bg-transparent text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        «
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((p, i) =>
          typeof p === "number" ? (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 rounded-md border border-gray-300 transition-all duration-150 focus:ring-2 focus:ring-blue-100 ${
                p === page
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-transparent text-gray-400 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="px-2 text-gray-400">
              …
            </span>
          )
        )}
      </div>

      {/* Last */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(totalPages)}
        className="px-3 py-1 border border-gray-300 rounded-md bg-transparent text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        »
      </button>

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-transparent text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        →
      </button>
    </div>
  )
}

export default Pagination
