"use client";

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
} from "reactflow";

import Sidebar from "./Sidebar";
import { Action, CreateStrategyPayload, Module } from "@/types/defi";
import { useDefiModules } from "@/hooks/use-defi-modules";
import DefiNode from "./DefiNode";

import { useCallback, useState } from "react";
import ConfigPanel from "./ConfigPanel";

import { createStrategyWorkflow } from "@/services/defi-module-service";
import { displayToast } from "@/components/shared/toast-manager";

const nodeTypes = {
  defiNode: DefiNode,
};

function Builder() {
  const { data: modules = [], isLoading } = useDefiModules();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /*
  BUILD WORKFLOW JSON
  */
  const buildWorkflowJson = (nodes: any[]) => {
    let stepNumber = 1;
    const steps = nodes.map((node, index) => {
      const config = node.data.config;
      // tokenIn
      let tokenIn = undefined;
      if (index === 0) {
        // step config
        if (config?.tokenInId) {
          tokenIn = {
            assetId: config.tokenInId,
            symbol: config.tokenInSymbol,
            amount: config.amount,
          };
        }
      } else {
        const prevConfig = nodes[index - 1].data.config;
        if (prevConfig?.tokenOutId) {
          tokenIn = {
            assetId: prevConfig.tokenOutId,
            symbol: prevConfig.tokenOutSymbol,
            amount: prevConfig.amountOut,
          };
        }
      }
      // tokenOut
      let tokenOut = undefined;
      if (config?.tokenOutId) {
        tokenOut = {
          assetId: config.tokenOutId,
          symbol: config.tokenOutSymbol,
          amount: config.amountOut,
        };
      }
      return {
        step: stepNumber++,
        type: node.data.action.name.toUpperCase().replace(" ", "_"),
        agent: node.data.module.name.toUpperCase(),
        tokenIn,
        tokenOut,
      };
    });
    return {
      loops: "1",
      fee: 0,
      steps,
    };
  };

  /*
  CREATE STRATEGY
  */
  const handleCreateStrategy = async () => {
    try {
      const workflow_json = buildWorkflowJson(nodes);
      await createStrategyWorkflow(workflow_json);
      displayToast("success", "Create Strategy successfully!")
    } catch (err) {
      console.error(err);
    }
  };

  /*
  DELETE NODE
  */
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id),
      );
    },
    [setNodes, setEdges],
  );

  /*
  ADD NODE
  */
  const handleAddNode = useCallback(
    (module: Module, action: Action) => {
      const id = crypto.randomUUID();
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
        };
        if (nds.length > 0) {
          const lastNode = nds[nds.length - 1];
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
                eds,
              ),
            );
          }, 0);
        }
        return [...nds, newNode];
      });
    },
    [handleDeleteNode, setEdges],
  );

  /*
  CONNECT
  */
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
          eds,
        ),
      ),
    [setEdges],
  );

  /*
  SAVE CONFIG
  */
  const handleSaveConfig = (payload: CreateStrategyPayload) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === payload.nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: payload,
              },
            }
          : node,
      ),
    );

    // update selectedNode
    setSelectedNode((prev: any) =>
      prev
        ? {
            ...prev,
            data: {
              ...prev.data,
              config: payload,
            },
          }
        : prev,
    );
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading modules...
      </div>
    );
  }

  return (
    <div className="flex h-screen text-white">
      {/* Sidebar */}
      <div className="w-72 border-r">
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
        >
          {/* CREATE BUTTON */}
          <button
            onClick={handleCreateStrategy}
            disabled={nodes.length === 0 || loading}
            className="
              absolute
              bottom-50
              right-8
              px-6
              py-3
              bg-indigo-600
              hover:bg-indigo-500
              text-white
              rounded-xl
              shadow-lg
              z-10
            "
          >
            {loading ? "Creating..." : "Create Strategy"}
          </button>
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>

      {/* CONFIG PANEL */}
      {selectedNode && (
        <ConfigPanel
          node={selectedNode}
          nodes={nodes}
          onClose={() => setSelectedNode(null)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}
