"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { estimateSwap, getRequiredActionData } from "@/services/defi-module-service";
import { useEdges, Node } from "reactflow";

interface Props {
  node: Node<any>;
  nodes: Node<any>[];
  onSave: (payload: any) => void;
  onClose: () => void;
}

export default function ConfigPanel({ node, nodes, onSave, onClose }: Props) {
  const fallbackPairs = node.data.action.defi_pairs || [];

  const [requiredData, setRequiredData] = useState<any[]>([]);
  const [pairsLoading, setPairsLoading] = useState(false);

  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amount, setAmount] = useState("");
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState("");

  const edges = useEdges();
  const incomingEdge = edges.find((e) => e.target === node.id);
  const prevNode = nodes.find((n) => n.id === incomingEdge?.source);
  const prevConfig = prevNode?.data?.config;

  // fetch action required data
  useEffect(() => {
    const actionId = node?.data?.action?.id;
    if (!actionId) return;

    const fetchRequired = async () => {
      try {
        setPairsLoading(true);
        const res = await getRequiredActionData(actionId);
        setRequiredData(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to fetch required action data:", err);
        setRequiredData([]);
      } finally {
        setPairsLoading(false);
      }
    };

    fetchRequired();
  }, [node?.data?.action?.id]);

  // extract pairs from API, fallback to node data
  const pairs = useMemo(() => {
    const apiPairs =
      requiredData?.[0]?.defi_module_actions?.[0]?.defi_pairs || [];

    return apiPairs.length > 0 ? apiPairs : fallbackPairs;
  }, [requiredData, fallbackPairs]);

  // unique tokenIn options
  const tokenInOptions = useMemo(() => {
    const map = new Map();

    pairs.forEach((p: any) => {
      if (!map.has(p.token_in.id)) {
        map.set(p.token_in.id, p.token_in);
      }
    });

    return Array.from(map.values());
  }, [pairs]);

  // tokenOut options based on selected tokenIn
  const tokenOutOptions = useMemo(() => {
    return pairs
      .filter((p: any) => p.token_in.id === tokenIn)
      .map((p: any) => p.token_out);
  }, [pairs, tokenIn]);

  // init tokenIn/tokenOut when pairs loaded
  useEffect(() => {
    if (!pairs.length) return;

    const config = node?.data?.config;

    // restore existing config
    if (config?.tokenInId) {
      const matchedPair = pairs.find(
        (p: any) =>
          p.token_in.asset_id === config.tokenInId &&
          p.token_out.asset_id === config.tokenOutId
      );

      if (matchedPair) {
        setTokenIn(matchedPair.token_in.id);
        setTokenOut(matchedPair.token_out.id);
      } else {
        setTokenIn(pairs[0].token_in.id);
        setTokenOut(pairs[0].token_out.id);
      }

      setAmount(config.amount?.toString() || "");
      setEstimate({
        amount_out: config.amountOut,
        slippage: config.slippage,
      });

      return;
    }

    // autofill from previous node if connected
    if (prevConfig?.tokenOutId) {
      let pair = pairs.find(
        (p: any) => p.token_in.asset_id === prevConfig.tokenOutId
      );

      if (!pair) {
        console.warn("No pair match → fallback first pair");
        pair = pairs[0];
      }

      setTokenIn(pair.token_in.id);
      setTokenOut(pair.token_out.id);
      setAmount(prevConfig.amountOut?.toString() || "");
      return;
    }

    // default first pair
    setTokenIn(pairs[0].token_in.id);
    setTokenOut(pairs[0].token_out.id);
  }, [pairs, node?.data?.config, prevConfig]);

  // keep tokenOut valid when tokenIn changes
  useEffect(() => {
    if (!tokenIn) return;

    const validPair = pairs.find(
      (p: any) => p.token_in.id === tokenIn && p.token_out.id === tokenOut
    );

    if (!validPair) {
      const firstPair = pairs.find((p: any) => p.token_in.id === tokenIn);
      if (firstPair) {
        setTokenOut(firstPair.token_out.id);
      }
    }
  }, [tokenIn, tokenOut, pairs]);

  const selectedPair = pairs.find(
    (p: any) => p.token_in.id === tokenIn && p.token_out.id === tokenOut
  );

  const isValid =
    amount !== "" &&
    Number(amount) > 0 &&
    tokenIn &&
    tokenOut &&
    estimate !== null;

  const handleAmountChange = (value: string) => {
    if (!value) {
      setAmount("");
      setEstimate(null);
      setError("");
      return;
    }

    if (Number(value) <= 0) {
      setError("Amount must be greater than 0");
      setAmount("");
      setEstimate(null);
      return;
    }

    setError("");
    setAmount(value);
  };

  const handleEstimate = async () => {
    if (!amount || !selectedPair) {
      setEstimate(null);
      return;
    }

    try {
      setEstimating(true);

      const res = await estimateSwap({
        token_in_id: tokenIn,
        token_out_id: tokenOut,
        amount_in: Number(amount),
      });

      setEstimate(res);
    } catch (err) {
      console.error(err);
      setEstimate(null);
    } finally {
      setEstimating(false);
    }
  };

  useEffect(() => {
    if (!amount || !selectedPair) return;
    handleEstimate();
  }, [amount, tokenIn, tokenOut]);

  const handleSubmit = async () => {
    if (!isValid || !selectedPair) return;

    const payload = {
      nodeId: node.id,
      moduleId: node.data.module.id,
      actionId: node.data.action.id,

      tokenInId: selectedPair.token_in.asset_id,
      tokenOutId: selectedPair.token_out.asset_id,

      tokenInSymbol: selectedPair.token_in.name,
      tokenOutSymbol: selectedPair.token_out.name,

      amount: Number(amount),
      amountOut: estimate.amount_out,
      slippage: estimate.slippage,
    };

    try {
      setLoading(true);
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="
          fixed inset-0
          bg-black/30
          backdrop-blur-[1px]
          z-40
        "
      />

      {/* Panel */}
      <div
        className="
          fixed
          right-8
          top-[56%] -translate-y-1/2
          w-[360px]
          h-[600px]
          rounded-2xl
          bg-gradient-to-br from-[#18182a] to-[#0f0f1a]
          border border-white/10
          shadow-[0_0_40px_rgba(0,0,0,0.6)]
          z-50
          flex flex-col
          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            px-6 py-5
            border-b border-white/10
            flex justify-between items-start
          "
        >
          <div>
            <p className="text-xs text-neutral-500 uppercase">
              {node.data.module.name}
            </p>

            <h2 className="text-lg font-semibold text-white mt-1">
              {node.data.action.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              text-neutral-400
              hover:text-white
              transition
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {pairsLoading && (
            <div className="text-sm text-neutral-500 bg-[#141420] p-4 rounded-xl border border-white/10">
              Loading action requirements...
            </div>
          )}

          {!pairsLoading && pairs.length === 0 && (
            <div className="text-sm text-red-400 bg-[#141420] p-4 rounded-xl border border-white/10">
              No valid token pairs found for this action.
            </div>
          )}

          {pairs.length > 0 && (
            <>
              {/* Token In */}
              <div className="space-y-3">
                <label className="text-xs text-neutral-400">Token In</label>

                <select
                  value={tokenIn}
                  disabled={!!incomingEdge}
                  onChange={(e) => setTokenIn(e.target.value)}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    bg-[#141420]
                    border border-white/10
                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-500
                  "
                >
                  {tokenInOptions.map((token: any) => (
                    <option key={token.id} value={token.id}>
                      {token.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={amount}
                  disabled={!!incomingEdge}
                  placeholder="Enter amount"
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    bg-[#141420]
                    border border-white/10
                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-500
                  "
                />

                {error && <p className="text-red-400 text-xs">{error}</p>}
              </div>

              {/* Token Out */}
              <div className="space-y-3">
                <label className="text-xs text-neutral-400">Token Out</label>

                <select
                  value={tokenOut}
                  onChange={(e) => setTokenOut(e.target.value)}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    bg-[#141420]
                    border border-white/10
                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-500
                  "
                >
                  {tokenOutOptions.map((token: any) => (
                    <option key={token.id} value={token.id}>
                      {token.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimating */}
              {estimating && (
                <div
                  className="
                    text-sm text-neutral-500
                    bg-[#141420]
                    p-4
                    rounded-xl
                    border border-white/10
                  "
                >
                  Estimating...
                </div>
              )}

              {/* Result */}
              {estimate && selectedPair && (
                <div
                  className="
                    bg-gradient-to-br
                    from-indigo-500/10
                    to-pink-500/10
                    border border-indigo-500/20
                    p-5
                    rounded-xl
                  "
                >
                  <p className="text-xs text-neutral-400">Estimated Output</p>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-white
                      mt-1
                    "
                  >
                    {Number(estimate.amount_out).toFixed(6)}{" "}
                    {selectedPair.token_out.name}
                  </p>

                  <p
                    className="
                      text-xs
                      text-neutral-500
                      mt-1
                    "
                  >
                    Slippage: {(estimate.slippage * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="
            p-6
            border-t border-white/10
          "
        >
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading || pairs.length === 0}
            className="defi-btn-glass w-full"
          >
            Save Strategy
          </button>
        </div>
      </div>
    </>
  );
}