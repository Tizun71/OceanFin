"use client"

import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from "reactflow"

import Sidebar from "./Sidebar"
import { Action, CreateStrategyPayload, Module } from "@/types/defi"
import { useDefiModules } from "@/hooks/use-defi-modules"
import DefiNode from "./DefiNode"

import { useCallback, useEffect, useState } from "react"
import ConfigPanel from "./ConfigPanel"
import { createStrategy } from "@/services/defi-module-service"

const nodeTypes = {
  defiNode: DefiNode,
}

function Builder() {
  const { data: modules = [], isLoading } = useDefiModules()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    console.log(edges)
  }, [edges])

  /* Delete node */
  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    )
  }, [setNodes, setEdges])

  const handleAddNode = useCallback(
    (module: Module, action: Action) => {
      const id = crypto.randomUUID()

      setNodes((nds) => {
        const newNode = {
          id,
          type: "defiNode",
          position: {
            x: 250,
            y: nds.length * 180 + 50,
          },
          data: {
            id,
            module,
            action,
            onDelete: handleDeleteNode,
          },
        }

        if (nds.length > 0) {
          const lastNode = nds[nds.length - 1]

          setTimeout(() => {
            setEdges((eds) =>
              addEdge(
                {
                  id: `${lastNode.id}-${id}`,
                  source: lastNode.id,
                  target: id,
                  sourceHandle: "bottom",
                  targetHandle: "top",
                  type: "smoothstep",
                  animated: true,
                },
                eds
              )
            )
          }, 0)
        }

        return [...nds, newNode]
      })
    },
    [handleDeleteNode, setEdges]
  )

  /* Connect nodes manually */
  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  )

  const [selectedNode, setSelectedNode] = useState<any>(null)

  const handleSaveConfig = async (
    payload: CreateStrategyPayload
  ) => {
    try {
      const data = await createStrategy(payload)

      setNodes((nds) =>
        nds.map((node) =>
          node.id === payload.nodeId
            ? { ...node, data: { ...node.data, config: data } }
            : node
        )
      )

      setSelectedNode(null)
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className="p-6 text-white">Loading modules...</div>
  }

  return (
    <div className="flex h-full">
      <Sidebar modules={modules} onSelect={handleAddNode} />

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
          
        />
      </div>

      {selectedNode && (
        <ConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  )
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  )
}
