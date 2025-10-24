"use client"

import { Column, CommonTable } from "@/app/common/common-table"
import React from "react"

export type MyActivityRow = {
  date: string
  initialBalance: string
  lendAmount: string
  borrowAmount: string
  progress: string
  status: "Pending" | "Completed" | "Failed"
}

const myActivityData: MyActivityRow[] = [
  {
    date: "2025-10-24",
    initialBalance: "$5,000",
    lendAmount: "$2,000",
    borrowAmount: "$1,500",
    progress: "50%",
    status: "Pending",
  },
  {
    date: "2025-10-23",
    initialBalance: "$3,000",
    lendAmount: "$1,000",
    borrowAmount: "$500",
    progress: "100%",
    status: "Completed",
  },
]

const myActivityColumns: Column<MyActivityRow>[] = [
  { key: "date", label: "Date" },
  { key: "initialBalance", label: "Initial Balance" },
  { key: "lendAmount", label: "Lend Amount" },
  { key: "borrowAmount", label: "Borrow Amount" },
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
  {
    key: "action",
    label: "",
    render: (row) => (row.status === "Pending" ? <button className="text-blue-600">🔄</button> : null),
  },
]

export const MyActivityTable = () => <CommonTable columns={myActivityColumns} data={myActivityData} />
