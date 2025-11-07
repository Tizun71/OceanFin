"use client"

import { registerToast } from "@/components/shared/toast-manager"
import React, { useState, useEffect } from "react"

interface Toast {
  id: number
  status: "success" | "error" | "info" | "warning"
  message: string
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    registerToast((status, message) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, status: status as Toast["status"], message }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    })
  }, [])

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow text-white transition-all ${
              toast.status === "success"
                ? "bg-green-500"
                : toast.status === "error"
                ? "bg-red-500"
                : toast.status === "warning"
                ? "bg-yellow-500"
                : "bg-blue-500"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  )
}
