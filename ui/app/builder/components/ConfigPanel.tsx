"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function ConfigPanel({ node, onSave, onClose }: any) {
  const [tokenIn, setTokenIn] = useState("USDC")
  const [amount, setAmount] = useState("")
  const [tokenOut, setTokenOut] = useState("DOT")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return

    const payload = {
      nodeId: node.id,
      moduleId: node.data.module.id,
      actionId: node.data.action.id,
      tokenIn,
      amount,
      tokenOut,
    }

    try {
      setLoading(true)
      await onSave(payload)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <div
        className="
          fixed right-0 top-0 h-full w-[380px]
          bg-gradient-to-b from-[#141420] to-[#0f0f1a]
          border-l border-neutral-800
          shadow-2xl
          p-6
          z-50
          flex flex-col
          animate-slide-in
        "
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">
              {node.data.module.name}
            </p>
            <h2 className="text-lg font-semibold text-white">
              {node.data.action.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-6">

          {/* Token In */}
          <div>
            <label className="text-xs uppercase text-neutral-500 mb-2 block">
              Token In
            </label>

            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="
                w-full bg-[#1b1b2c]
                border border-neutral-800
                p-3 rounded-xl
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500
              "
            >
              <option>USDC</option>
              <option>DOT</option>
            </select>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="
                w-full mt-3
                bg-[#1b1b2c]
                border border-neutral-800
                p-3 rounded-xl
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500
              "
            />
          </div>

          {/* Token Out */}
          <div>
            <label className="text-xs uppercase text-neutral-500 mb-2 block">
              Token Out
            </label>

            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="
                w-full bg-[#1b1b2c]
                border border-neutral-800
                p-3 rounded-xl
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500
              "
            >
              <option>USDC</option>
              <option>DOT</option>
            </select>
          </div>
        </div>

        {/* Footer Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="
            mt-6
            w-full
            bg-gradient-to-r from-indigo-600 to-indigo-500
            hover:from-indigo-500 hover:to-indigo-400
            disabled:opacity-50
            transition
            rounded-2xl
            py-3
            font-semibold
            shadow-lg shadow-indigo-500/20
          "
        >
          {loading ? "Creating..." : "Create Strategy"}
        </button>
      </div>
    </>
  )
}
