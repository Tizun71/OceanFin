"use client";

import ReactFlow, {
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
} from "reactflow";

import Sidebar from "./Sidebar";
import ConfigPanel from "./ConfigPanel";
import CreateStrategyModal from "./CreateStrategyModal";
import DefiNode from "./DefiNode";
import { useDefiModules } from "@/hooks/use-defi-modules";
import { useDefiBuilder } from "@/hooks/use-strategy-builder";
import { useEffect } from "react";
import { usePreloader } from "@/providers/preloader-provider";
import { displayToast } from "@/components/shared/toast-manager";
import { canBeFirstStep, validateConnection } from "@/lib/defi-connection-rules";

const nodeTypes = {
  defiNode: DefiNode,
};

function Builder() {
  const { data: modules = [], isFetching } = useDefiModules();

  const {
    nodes,
    edges,
    selectedNode,
    showModal,
    creating,

    setSelectedNode,
    setShowModal,

    onNodesChange,
    onEdgesChange,
    setEdges, 

    addNode,
    saveConfig,
    createStrategy,
  } = useDefiBuilder();

  const { show, hide } = usePreloader();

  useEffect(() => {
    if (isFetching) {
      show();
    } else {
      hide();
    }
  }, [isFetching, show, hide]);

  const validateWorkflow = () => {
    if (!nodes || nodes.length === 0) {
      displayToast("error", "Please add at least one step before creating strategy.");
      return false;
    }

    const hasUnconfigured = nodes.some((node) => !node.data?.config);

    if (hasUnconfigured) {
      displayToast(
        "error",
        "Please configure and save all steps before creating strategy."
      );
      return false;
    }

    return true;
  };

  const handleAddNode = (module: any, action: any) => {
    const isFirstNode = nodes.length === 0;
    const operationType = action?.operation_type;

    if (isFirstNode) {
      const result = canBeFirstStep(operationType);

      if (!result.valid) {
        displayToast("error", result.message);
        return;
      }
    }

    addNode(module, action);
  };

  const getOperationType = (node: any) => {
    return (
      node?.data?.action?.operation_type ||
      node?.data?.module?.operation_type ||
      node?.data?.operation_type ||
      ""
    );
  };

  const isValidConnection = (connection: Connection) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    if (!sourceNode || !targetNode) return false;

    if (connection.source === connection.target) return false;

    const sourceType = getOperationType(sourceNode);
    const targetType = getOperationType(targetNode);

    const result = validateConnection(sourceType, targetType);

    return result.valid;
  };

  const handleConnect = (connection: Connection) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    if (!sourceNode || !targetNode) {
      displayToast("error", "Invalid connection.");
      return;
    }

    if (connection.source === connection.target) {
      displayToast("error", "A step cannot connect to itself.");
      return;
    }

    const edgeExists = edges.some(
      (edge) =>
        edge.source === connection.source && edge.target === connection.target
    );

    if (edgeExists) {
      displayToast("error", "This connection already exists.");
      return;
    }

    const sourceType = getOperationType(sourceNode);
    const targetType = getOperationType(targetNode);

    const result = validateConnection(sourceType, targetType);

    if (!result.valid) {
      displayToast("error", result.message);
      return;
    }

    setEdges((eds) => addEdge(connection, eds));
  };

  return (
    <div className="flex flex-1 text-white px-6 pb-6 pt-4 min-h-0 gap-6">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/10">
        <Sidebar modules={modules} onSelect={handleAddNode} />
      </div>

      {/* Canvas */}
      <div
        className="
        flex-1
        relative
        bg-white/15
        backdrop-blur-md
        border border-white/20
        rounded-2xl
        overflow-hidden
        "
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          isValidConnection={isValidConnection}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
        >
          {/* CREATE BUTTON */}
          <button
            onClick={() => {
              if (!validateWorkflow()) return;
              setShowModal(true);
            }}
            className="defi-btn-glass defi-create-btn"
          >
            Create Strategy
          </button>

          <MiniMap
            className="defi-minimap"
            style={{
              width: 140,
              height: 90,
            }}
          />

          <Controls />

          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255,255,255,0.1)"
          />
        </ReactFlow>
      </div>

      {/* CONFIG PANEL */}
      {selectedNode && (
        <ConfigPanel
          node={selectedNode}
          nodes={nodes}
          onClose={() => setSelectedNode(null)}
          onSave={saveConfig}
        />
      )}

      <CreateStrategyModal
        open={showModal}
        loading={creating}
        onClose={() => setShowModal(false)}
        onCreate={createStrategy}
      />
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