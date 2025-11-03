"use client"

import { Column, CommonTable } from "@/app/common/common-table"
import React from "react"

export type AllActivityRow = {
  date: string
  user: string
  initialBalance: string
  progress: string
  status: "Pending" | "Completed" | "Failed"
}

const allActivityData: AllActivityRow[] = [
  { date: "2025-10-24", user: "0xAbc...123", initialBalance: "$5,000", progress: "50%", status: "Pending" },
  { date: "2025-10-23", user: "0xDef...456", initialBalance: "$3,000", progress: "100%", status: "Completed" },
]

const allActivityColumns: Column<AllActivityRow>[] = [
  { key: "date", label: "Date" },
  { key: "user", label: "User Address" },
  { key: "initialBalance", label: "Initial Balance" },
  { key: "progress", label: "Progress" },
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
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {row.status}
      </span>
    ),
  },
]

export const AllActivityTable = () => <CommonTable columns={allActivityColumns} data={allActivityData} />
