"use client"

import { useState } from "react"

type CreateStrategyButtonProps = {
  disabled?: boolean
  onCreate: () => Promise<void>
}

export default function CreateStrategyButton({
  disabled,
  onCreate,
}: CreateStrategyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (loading) return

    try {
      setError(null)
      setLoading(true)

      await onCreate()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to create strategy")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="
          w-full rounded-2xl py-3 font-semibold
          bg-indigo-600 hover:bg-indigo-500
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-indigo-500/30
        "
      >
        {loading ? "Creating Strategy..." : "Create Strategy"}
      </button>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
