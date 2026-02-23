"use client"

import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
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

  const [selectedNode, setSelectedNode] = useState<any>(null)

  /* Delete node */
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id))
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      )
    },
    [setNodes, setEdges]
  )

  /* Add node */
  const handleAddNode = useCallback(
    (module: Module, action: Action) => {
      const id = crypto.randomUUID()

      setNodes((nds) => {
        const newNode = {
          id,
          type: "defiNode",
          position: {
            x: 250,
            y: nds.length * 180 + 80,
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
                  style: {
                    stroke: "#6366f1",
                    strokeWidth: 2,
                  },
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

  /* Manual connect */
  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: {
              stroke: "#6366f1",
              strokeWidth: 2,
            },
          },
          eds
        )
      ),
    [setEdges]
  )

  /* Save config */
  const handleSaveConfig = async (
    payload: CreateStrategyPayload
  ) => {
    const strategy = await createStrategy(payload)

    setNodes((nds) =>
      nds.map((node) =>
        node.id === payload.nodeId
          ? {
              ...node,
              data: {
                ...node.data,

                config: strategy,

                tokenInSymbol:
                  payload.tokenInSymbol,

                tokenOutSymbol:
                  payload.tokenOutSymbol,
              },
            }
          : node
      )
    )

    setSelectedNode(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        Loading modules...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <Sidebar modules={modules} onSelect={handleAddNode} />
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
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
            style: {
              stroke: "#6366f1",
              strokeWidth: 2,
            },
          }}
          className="bg-slate-950"
        >
          <MiniMap
            zoomable
            pannable
            className="bg-slate-900 rounded-lg border border-slate-700"
          />

          <Controls />

          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#334155"
          />
        </ReactFlow>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-slate-500 text-lg">
              Select a module to start building your strategy 🚀
            </div>
          </div>
        )}
      </div>

      {/* Config Drawer */}
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
