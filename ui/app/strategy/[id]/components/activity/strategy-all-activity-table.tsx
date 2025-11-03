"use client"

import { Column, CommonTable } from "@/app/common/common-table"
import React from "react"

export type AllActivityRow = {
  date: string
  user: string
  step: string
  apr: string
  fee: string
  status: "Pending" | "Completed" | "Failed"
}

const allActivityData: AllActivityRow[] = [
  {
    date: "2025-11-03",
    user: "0xAbc...123",
    step: "Step 5 / 8",
    apr: "4.5%",
    fee: "1%",
    status: "Pending",
  },
  {
    date: "2025-11-02",
    user: "0xDef...456",
    step: "Step 8 / 8",
    apr: "3.8%",
    fee: "0.9%",
    status: "Completed",
  },
]

const allActivityColumns: Column<AllActivityRow>[] = [
  { key: "date", label: "Date" },
  { key: "user", label: "User Address" },
  { key: "step", label: "Progress" },
  { key: "apr", label: "APR" },
  { key: "fee", label: "Fee" },
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

export const AllActivityTable = () => (
  <CommonTable columns={allActivityColumns} data={allActivityData} />
)
