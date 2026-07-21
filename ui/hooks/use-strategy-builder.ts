"use client";

import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from "reactflow";
import { useCallback, useEffect, useRef, useState } from "react";

import { Module, Action, CreateStrategyPayload } from "@/types/defi";
import { displayToast } from "@/components/shared/toast-manager";
import { useUser } from "@/providers/user-provider";

import { validateAddNode } from "@/lib/defi-builder-validation";
import { nodeRequiresInput } from "@/lib/defi-node-input";
import { resolveDefiOperationType } from "@/app/builder/components/nodes/defi-node-utils";
import { estimateDefiOperation } from "@/services/defi-module-service";
import {
  createDefiNode,
  createDefiEdge,
  markLastNode,
} from "@/lib/defi-node-factory";
import { buildWorkflowJson } from "@/lib/defi-workflow-builder";
import { submitStrategy } from "@/services/defi-strategy-builder";
import { useActiveChain } from "@/hooks/use-active-chain";
import { useRouter } from "next/navigation";

type SaveConfigPayload = CreateStrategyPayload & {
  operationType?: string;
  estimate?: any;

  // pair ids from ConfigPanel
  tokenInPairId?: string;
  tokenOutPairId?: string;

  // optional UI helpers
  tokenInSymbol?: string;
  tokenOutSymbol?: string;
  amountOut?: number | null;
  slippage?: number | null;
  apy?: number | null;
  ltv?: number | null;
};

const getEstimateAmountOut = (est: any, fallbackAmount?: number) => {
  return (
    est?.amount_out ??
    est?.output_amount ??
    est?.result_amount ??
    est?.received_amount ??
    est?.deposit_amount ??
    est?.borrow_amount ??
    est?.shares_out ??
    fallbackAmount ??
    null
  );
};

const getEstimateOutputAssetId = (est: any, payload: SaveConfigPayload) => {
  return (
    est?.token_out_id ||
    est?.output_token_id ||
    est?.result_asset_id ||
    est?.asset_id ||
    est?.vault_token_id ||
    payload?.tokenOutId ||
    payload?.tokenInId ||
    undefined
  );
};

const getEstimateOutputSymbol = (est: any, payload: SaveConfigPayload) => {
  return (
    est?.token_out_symbol ||
    est?.output_token_symbol ||
    est?.result_asset_symbol ||
    est?.asset_symbol ||
    est?.vault_token_symbol ||
    payload?.tokenOutSymbol ||
    payload?.tokenInSymbol ||
    ""
  );
};

export function useDefiBuilder() {
  const { user } = useUser();
  const { activeChain } = useActiveChain();
  const router = useRouter();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  /*
   * DELETE NODE
   */
  const deleteNode = useCallback(
    (id: string) => {
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
    },
    [setNodes, setEdges],
  );

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
  const onConnect = useCallback(
    (params: Edge | Connection) => {
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
    },
    [setEdges],
  );

  /*
   * SAVE CONFIG
   */
  
  const saveConfig = useCallback(
    async (payload: SaveConfigPayload, opts?: { silent?: boolean }) => {
      const currentNode = nodes.find((node) => node.id === payload.nodeId);
      const action = currentNode?.data?.action;
      const actionName =
        payload.operationType ||
        action?.name?.toUpperCase?.() ||
        "SWAP";

      try {
        const finalEstimate = payload.estimate ?? null;

        const rawTokenOutId = getEstimateOutputAssetId(finalEstimate, payload);

        let finalTokenInAssetId = payload.tokenInId;
        let finalTokenOutAssetId = rawTokenOutId;

        if (Array.isArray(action?.defi_pairs)) {

          const pairForIn = action.defi_pairs.find(
            (p: any) => p?.token_in?.id === payload.tokenInId
          );
          if (pairForIn?.token_in?.asset_id)
            finalTokenInAssetId = pairForIn.token_in.asset_id;

          const pairForOut = action.defi_pairs.find(
            (p: any) => p?.token_out?.id === rawTokenOutId
          );
          if (pairForOut?.token_out?.asset_id)
            finalTokenOutAssetId = pairForOut.token_out.asset_id;
        }

        const finalConfig = {
          ...payload,
          tokenInId: finalTokenInAssetId,    
          tokenOutId: finalTokenOutAssetId,  
          operationType: actionName,
          estimate: finalEstimate,
          amountOut: getEstimateAmountOut(finalEstimate, payload.amount),
          tokenOutSymbol: getEstimateOutputSymbol(finalEstimate, payload),
        };

        setNodes((nds) =>
          nds.map((node) =>
            node.id === payload.nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    config: finalConfig,
                    estimate: finalEstimate,
                  },
                }
              : node
          )
        );

        setSelectedNode((prev: any) =>
          prev && prev.id === payload.nodeId
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  config: finalConfig,
                  estimate: finalEstimate,
                },
              }
            : prev
        );

        if (!opts?.silent) {
          displayToast("success", "Configuration saved successfully.");
        }
      } catch (error) {
        console.error("SAVE CONFIG ERROR:", error);
        displayToast("error", "Failed to save configuration.");
      }
    },
    [nodes, setNodes]
  );

  /*
   * AUTO-CONFIGURE no-input steps (e.g. a chained SUPPLY). Its input token and
   * amount come from the previous step's output, so there is nothing for the
   * user to enter — estimate and persist it silently instead of opening a panel
   * full of locked fields.
   */
  const autoConfiguringRef = useRef<Set<string>>(new Set());

  const autoConfigureStep = useCallback(
    async (node: any, prevConfig: any) => {
      try {
        const action = node?.data?.action;
        const module = node?.data?.module;
        const pairs: any[] = Array.isArray(action?.defi_pairs)
          ? action.defi_pairs
          : [];

        const prevTokenId = prevConfig?.tokenOutId || prevConfig?.tokenInId;
        const amount = prevConfig?.amountOut ?? prevConfig?.amount;
        if (prevTokenId == null || amount == null) return;

        const pair =
          pairs.find(
            (p) =>
              p?.token_in?.asset_id === prevTokenId ||
              p?.token_in?.id === prevTokenId
          ) || pairs[0];
        const meta = pair?.token_in;
        if (!meta) return;

        const operationType = resolveDefiOperationType(node.data) || "SUPPLY";

        const estimate = await estimateDefiOperation({
          operation_type: operationType,
          token_in_id: meta.id,
          amount_in: Number(amount),
          module_id: module?.id,
          action_id: action?.id,
          protocol: module?.protocol,
        });

        await saveConfig(
          {
            nodeId: node.id,
            moduleId: module?.id,
            actionId: action?.id,
            operationType,
            tokenInPairId: meta.id,
            tokenInId: meta.asset_id || meta.id,
            tokenInSymbol: meta.name || "",
            tokenInAddress: meta.address ?? undefined,
            tokenInDecimals: meta.decimals ?? undefined,
            amount: Number(amount),
            estimate,
            apy: estimate?.supply_apy ?? estimate?.apy ?? null,
          } as any,
          { silent: true }
        );
      } catch (err) {
        console.error("AUTO CONFIG ERROR:", err);
      }
    },
    [saveConfig]
  );

  useEffect(() => {
    const last = nodes[nodes.length - 1];
    if (!last || last.data?.config) return;
    if (nodeRequiresInput(last, edges)) return;
    if (autoConfiguringRef.current.has(last.id)) return;

    const incoming = edges.find((e) => e.target === last.id);
    const prev = nodes.find((n) => n.id === incoming?.source);
    const prevConfig = prev?.data?.config;
    if (!prevConfig) return;

    autoConfiguringRef.current.add(last.id);
    void autoConfigureStep(last, prevConfig).finally(() => {
      autoConfiguringRef.current.delete(last.id);
    });
  }, [nodes, edges, autoConfigureStep]);

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
          chainContext: activeChain.name,
        });

        displayToast("success", "Strategy created successfully.");
        setShowModal(false);

        router.push("/strategy");

      } catch (error) {
        console.error(error);
        displayToast("error", "Failed to create strategy.");
      } finally {
        setCreating(false);
      }
    },
    [user, nodes, router, activeChain],
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