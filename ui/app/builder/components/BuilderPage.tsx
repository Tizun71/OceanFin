"use client"

import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow"

import Sidebar from "./Sidebar"
import { Action, Module } from "@/types/defi"
import { useDefiModules } from "@/hooks/use-defi-modules"

export default function BuilderPage() {
  const { data: modules = [], isLoading } = useDefiModules()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const handleAddNode = (module: Module, action: Action) => {
    const newNode = {
      id: crypto.randomUUID(),
      type: "default",
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        moduleId: module.id,
        actionId: action.id,
        label: `${module.name} - ${action.name}`,
      },
    }

    setNodes((nds) => [...nds, newNode])
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(params) =>
            setEdges((eds) => addEdge(params, eds))
          }
        />
      </div>
    </div>
  )
}
