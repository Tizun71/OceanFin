"use client";

import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from "reactflow";
import { useCallback, useState } from "react";

import { Module, Action, CreateStrategyPayload } from "@/types/defi";
import { displayToast } from "@/components/shared/toast-manager";
import { useUser } from "@/providers/user-provider";

import { validateAddNode } from "@/lib/defi-builder-validation";
import {
  createDefiNode,
  createDefiEdge,
  markLastNode,
} from "@/lib/defi-node-factory";
import { buildWorkflowJson } from "@/lib/defi-workflow-builder";
import { submitStrategy } from "@/services/defi-strategy-builder";

export function useDefiBuilder() {
  const { user } = useUser();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  /*
   * DELETE NODE
   */
  const deleteNode = useCallback((id: string) => {
    let deleted = false;
    let showError = false;

    setNodes((nds) => {
      const lastNode = nds[nds.length - 1];

      if (!lastNode || lastNode.id !== id) {
        showError = true;
        return nds;
      }

      deleted = true;

      const newNodes = nds.slice(0, -1);

      return markLastNode(newNodes);
    });

    if (showError) {
      displayToast("error", "Only the last node can be deleted.");
      return;
    }

    if (deleted) {
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id),
      );

      displayToast("success", "Node deleted successfully.");
    }
  }, [setNodes, setEdges]);

  /*
   * ADD NODE
   */
  const addNode = useCallback(
    (module: Module, action: Action) => {
      let added = false;
      let showError = false;
      let errorMessage = "";

      setNodes((nds) => {
        const validation = validateAddNode({
          nodes: nds,
          selectedNode,
          action,
        });

        if (!validation.valid) {
          showError = true;
          errorMessage = validation.message;
          return nds;
        }

        const updatedNodes = nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isLastNode: false,
          },
        }));

        const newNode = createDefiNode({
          module,
          action,
          index: nds.length,
          onDelete: deleteNode,
        });

        added = true;

        if (updatedNodes.length > 0) {
          const prevNode = updatedNodes[updatedNodes.length - 1];

          setEdges((eds) => [...eds, createDefiEdge(prevNode.id, newNode.id)]);
        }

        return [...updatedNodes, newNode];
      });

      if (showError) {
        displayToast("error", errorMessage || "Invalid step flow.");
        return;
      }

      if (added) {
        displayToast("success", "Node added successfully.");
      }
    },
    [deleteNode, selectedNode, setNodes, setEdges],
  );

  /*
   * MANUAL CONNECT (optional)
   */
  const onConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => {
      const alreadyConnected = eds.some(
        (edge) => edge.source === params.source,
      );

      if (alreadyConnected) {
        return eds;
      }

      return addEdge(
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
      );
    });
  }, [setEdges]);

  /*
   * SAVE CONFIG
   */
  const saveConfig = useCallback((payload: CreateStrategyPayload) => {
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

    displayToast("success", "Configuration saved successfully.");
  }, [setNodes]);

  /*
   * CREATE STRATEGY
   */
  const createStrategy = useCallback(
    async (name: string) => {
      if (!user) {
        displayToast("error", "Please connect your wallet first.");
        return;
      }

      try {
        setCreating(true);

        const workflowJson = buildWorkflowJson(nodes);

        await submitStrategy({
          userId: user.id,
          name,
          workflowJson,
        });

        displayToast("success", "Strategy created successfully.");
        setShowModal(false);
      } catch (error) {
        console.error(error);
        displayToast("error", "Failed to create strategy.");
      } finally {
        setCreating(false);
      }
    },
    [user, nodes],
  );

  return {
    nodes,
    edges,

    selectedNode,
    showModal,
    creating,

    setSelectedNode,
    setShowModal,

    onNodesChange,
    onEdgesChange,
    onConnect,

    setEdges,

    addNode,
    deleteNode,
    saveConfig,
    createStrategy,
  };
}