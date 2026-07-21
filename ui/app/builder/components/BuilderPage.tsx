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
import { useActiveChain } from "@/hooks/use-active-chain";
import { useDefiBuilder } from "@/hooks/use-strategy-builder";
import { useEffect } from "react";
import { usePreloader } from "@/providers/preloader-provider";
import { displayToast } from "@/components/shared/toast-manager";
import { canBeFirstStep, validateConnection } from "@/lib/defi-connection-rules";
import { resolveDefiOperationType } from "@/app/builder/components/nodes/defi-node-utils";
import { nodeRequiresInput } from "@/lib/defi-node-input";

const nodeTypes = {
  defiNode: DefiNode,
};

function Builder() {
  const { activeChain } = useActiveChain();
  const { data: modules = [], isFetching } = useDefiModules(activeChain.slug);

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

  // Hide loader when component mounts (after navigation)
  useEffect(() => {
    hide();
  }, [hide]);

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
    // defi_module_actions has no operation_type column — the type is derived
    // from the action name. Reading action.operation_type directly made every
    // action fail validation as "Invalid action type".
    const operationType = resolveDefiOperationType({ module, action });

    if (isFirstNode) {
      const result = canBeFirstStep(operationType);

      if (!result.valid) {
        displayToast("error", result.message);
        return;
      }
    }

    addNode(module, action);
  };

  const getOperationType = (node: any) => resolveDefiOperationType(node?.data) ?? "";

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

  const configuredCount = nodes.filter((n) => n.data?.config).length;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 min-h-0 flex-col gap-5 px-6 pb-6 pt-2">
      {/* Page header: the canvas alone gave no indication of what this screen
          is or how far along the strategy is. */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-light">
            Visual builder
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Compose a strategy step by step
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm tabular-nums text-muted-foreground">
            {nodes.length === 0
              ? "No steps yet"
              : `${configuredCount}/${nodes.length} steps configured`}
          </p>

          <button
            type="button"
            onClick={() => {
              if (!validateWorkflow()) return;
              setShowModal(true);
            }}
            className="inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition-all duration-200 hover:bg-accent-light active:translate-y-px"
          >
            Create strategy
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-5">
        {/* Sidebar */}
        <div className="w-80 shrink-0">
          <Sidebar modules={modules} onSelect={handleAddNode} />
        </div>

        {/* Canvas */}
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-[var(--shadow-lg)]">
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-[var(--z-raised)] grid place-items-center px-6">
              <p className="max-w-[34ch] text-center text-sm leading-relaxed text-muted-foreground">
                Pick an action from the module library to drop in the first step.
                Strategies start with a supply or a swap.
              </p>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            isValidConnection={isValidConnection}
            onNodeClick={(_, node) => {
              // Only steps that actually need input open the panel. A chained
              // SUPPLY is auto-configured, so opening it would just show locked
              // fields — unless auto-config hasn't landed a config yet.
              if (nodeRequiresInput(node, edges) || !node.data?.config) {
                setSelectedNode(node);
              }
            }}
            fitView
          >
            <MiniMap className="defi-minimap" style={{ width: 140, height: 90 }} />

            <Controls />

            <Background
              variant={BackgroundVariant.Dots}
              gap={25}
              size={1.5}
              color="rgba(0, 194, 203, 0.15)"
            />
          </ReactFlow>
        </div>
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