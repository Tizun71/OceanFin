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
import { createStrategyWorkflow } from "@/services/defi-module-service";
import { displayToast } from "@/components/shared/toast-manager";
import { useUser } from "@/providers/user-provider";

export function useDefiBuilder() {
  const { user } = useUser();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  /*
  BUILD WORKFLOW JSON
  */
  const buildWorkflowJson = (nodes: any[]) => {
    let stepNumber = 1;

    const steps = nodes.map((node, index) => {
      const config = node.data.config;

      let tokenIn;

      if (index === 0) {
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

      let tokenOut;

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
  DELETE NODE
  */
 const deleteNode = useCallback((id: string) => {

  let deleted = false;

  setNodes((nds) => {

    const lastNode = nds[nds.length - 1];

    if (!lastNode || lastNode.id !== id) {

      displayToast(
        "error",
        "Only the last node can be deleted."
      );

      return nds;
    }

    deleted = true;

    const newNodes = nds.slice(0, -1);

    return newNodes.map((node, index) => ({
      ...node,
      data: {
        ...node.data,
        isLastNode: index === newNodes.length - 1,
      },
    }));

  });

  if (deleted) {

    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== id &&
          edge.target !== id
      )
    );

    displayToast(
      "success",
      "Node deleted successfully."
    );

  }

}, []);
  /*
  ADD NODE
  */
  const addNode = useCallback(
  (module: Module, action: Action) => {

    const id = crypto.randomUUID();

    setNodes((nds) => {

      const newIndex = nds.length;

      const updatedNodes = nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isLastNode: false,
        },
      }));

      const newNode = {
        id,
        type: "defiNode",

        position: {
          x: 250,
          y: newIndex * 180 + 80,
        },

        data: {
          id,
          module,
          action,
          onDelete: deleteNode,
          isLastNode: true,
        },
      };

      if (updatedNodes.length > 0) {

        const prevNode =
          updatedNodes[updatedNodes.length - 1];

        setEdges((eds) => [

          ...eds,

          {
            id: `${prevNode.id}-${id}`,
            source: prevNode.id,
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

        ]);

      }

      return [...updatedNodes, newNode];

    });

  },
  [deleteNode],
);

  /*
  CONNECT
  */
 const onConnect = useCallback(
  (params: Edge | Connection) => {

    setEdges((eds) => {

      const alreadyConnected = eds.some(
        (edge) => edge.source === params.source
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

  },
  [],
);

  /*
  SAVE CONFIG
  */
  const saveConfig = (payload: CreateStrategyPayload) => {
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
  };

  /*
  CREATE STRATEGY
  */
  const createStrategy = async (name: string) => {
    if (!user) {
      displayToast("error", "Please connect your wallet first.");
      return;
    }

    try {
      setCreating(true);

      const workflow_json = buildWorkflowJson(nodes);

      const payload = {
        owner_id: user.id,
        name,
        description: "Strategy description",
        is_public: true,
        chain_context: "Hydration",
        status: "draft",
        workflow_json,
        workflow_graph: workflow_json,
      };

      await createStrategyWorkflow(payload);

      displayToast(
        "success",
        "Strategy created successfully.",
      );

      setShowModal(false);
    } catch (error) {
      console.error(error);

      displayToast(
        "error",
        "Failed to create strategy.",
      );
    } finally {
      setCreating(false);
    }
  };

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


    addNode,
    deleteNode,

    saveConfig,

    createStrategy,
  };
}