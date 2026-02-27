"use client";

import ReactFlow, {
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from "reactflow";

import Sidebar from "./Sidebar";
import ConfigPanel from "./ConfigPanel";
import CreateStrategyModal from "./CreateStrategyModal";
import DefiNode from "./DefiNode";
import { useDefiModules } from "@/hooks/use-defi-modules";
import { useDefiBuilder } from "@/hooks/use-strategy-builder";

const nodeTypes = {
  defiNode: DefiNode,
};

function Builder() {
  const { data: modules = [], isLoading } = useDefiModules();

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
   

    addNode,
    saveConfig,
    createStrategy,
  } = useDefiBuilder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading modules...
      </div>
    );
  }

  return (
    <div className="flex flex-1 text-white px-6 pb-6 pt-4 min-h-0 gap-6">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/10">
        <Sidebar modules={modules} onSelect={addNode} />
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
          
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
        >
          {/* CREATE BUTTON */}
          <button
            onClick={() => setShowModal(true)}
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