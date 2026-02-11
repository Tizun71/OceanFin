import { useState } from "react"

export function useBuilderState() {
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [tokenIn, setTokenIn] = useState(null)
  const [tokenOut, setTokenOut] = useState(null)
  const [amount, setAmount] = useState(0)

  return {
    nodes,
    setNodes,
    selectedNode,
    setSelectedNode,
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    amount,
    setAmount,
  }
}
