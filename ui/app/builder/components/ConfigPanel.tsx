"use client"

import { useState } from "react"

export default function ConfigPanel({ node, onSave, onClose }: any) {
  const [tokenIn, setTokenIn] = useState("USDC")
  const [amount, setAmount] = useState("")
  const [tokenOut, setTokenOut] = useState("DOT")

  const handleSubmit = async () => {
    const payload = {
      nodeId: node.id,
      moduleId: node.data.module.id,
      actionId: node.data.action.id,
      tokenIn,
      amount,
      tokenOut,
    }

    await onSave(payload)
  }

  return (
    <div className="w-[320px] border-l border-neutral-800 p-6 space-y-6 bg-neutral-950 text-white">

      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Configure</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div>
        <p className="text-xs uppercase text-neutral-500 mb-2">
          Token In
        </p>

        <select
          value={tokenIn}
          onChange={(e) => setTokenIn(e.target.value)}
          className="w-full bg-neutral-800 p-3 rounded-xl"
        >
          <option>USDC</option>
          <option>DOT</option>
        </select>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full mt-3 bg-neutral-800 p-3 rounded-xl"
        />
      </div>

      <div>
        <p className="text-xs uppercase text-neutral-500 mb-2">
          Token Out
        </p>

        <select
          value={tokenOut}
          onChange={(e) => setTokenOut(e.target.value)}
          className="w-full bg-neutral-800 p-3 rounded-xl"
        >
          <option>USDC</option>
          <option>DOT</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-500 transition rounded-2xl py-3 font-semibold"
      >
        Create strategy
      </button>
    </div>
  )
}
