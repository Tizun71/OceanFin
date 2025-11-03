"use client"

import React from "react"
import { motion } from "framer-motion"

export type Column<T = any> = {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

type CommonTableProps<T = any> = {
  columns: Column<T>[]
  data: T[]
}

export const CommonTable = <T extends {}>({ columns, data }: CommonTableProps<T>) => {
  return (
    <div className="bg-white text-gray-900 rounded-2xl p-4 border border-gray-200 shadow-md overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-gray-600 border-b border-gray-300 text-left">
            {columns.map((col) => (
              <th key={col.key} className="py-3 px-4">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <motion.tr
              key={idx}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-gray-900">
                    <td key={col.key} className="py-3 px-4 text-gray-900">
                        { col.render ? col.render(row) : (row as any)[col.key] ?? "-"}
                    </td>
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
