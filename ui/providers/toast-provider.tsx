"use client"

import { registerToast } from "@/components/shared/toast-manager"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import React, { useState, useEffect } from "react"

interface Toast {
  id: number
  status: "success" | "error" | "info" | "warning"
  message: string
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastConfig = {
    success: {
      icon: CheckCircle2,
      style: {
        backgroundColor: "rgba(16, 185, 129, 0.1)", 
        border: "1px solid rgba(16, 185, 129, 0.2)",
        color: "#10b981",
        backdropFilter: "blur(10px)",
      },
      iconColor: "#10b981",
    },
    error: {
      icon: XCircle,
      style: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.2)", 
        color: "#ef4444", 
        backdropFilter: "blur(10px)",
      },
      iconColor: "#ef4444",
    },
    warning: {
      icon: AlertCircle,
      style: {
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        color: "#f59e0b", 
        backdropFilter: "blur(10px)",
      },
      iconColor: "#f59e0b",
    },
    info: {
      icon: Info,
      style: {
        backgroundColor: "rgba(59, 130, 246, 0.1)", 
        border: "1px solid rgba(59, 130, 246, 0.2)",
        color: "#3b82f6", 
        backdropFilter: "blur(10px)",
      },
      iconColor: "#3b82f6",
    },
  };

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
      <div className="fixed bottom-15 right-10 flex flex-col gap-3 z-50 pointer-events-none">
        {toasts.map((toast) => {
          const config = toastConfig[toast.status];
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`
                flex items-center gap-3 min-w-[320px] max-w-md px-4 py-3.5 
                rounded-xl border shadow-xl
                animate-toast-slide-in
                pointer-events-auto
                group
                transition-all duration-200 hover:scale-[1.02]
              `}
              style={toastConfig[toast.status].style}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
              <span className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}