"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  estimateDefiOperation,
  getRequiredActionData,
  type EstimateDefiOperationPayload,
} from "@/services/defi-module-service";
import { useEdges, Node } from "reactflow";
import { DefiOperationType } from "@/app/builder/components/nodes/defi-node.types";
import Image from "next/image";
import { assetIcons } from "@/lib/iconMap";

interface Props {
  node: Node<any>;
  nodes: Node<any>[];
  onSave: (payload: any) => void;
  onClose: () => void;
}

type DefiPair = {
  token_in?: {
    id?: string;
    asset_id?: string;
    name?: string;
  };
  token_out?: {
    id?: string;
    asset_id?: string;
    name?: string;
  };
};

const normalizeOperationType = (value: unknown): DefiOperationType => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  const validTypes: DefiOperationType[] = [
    "SWAP",
    "SUPPLY",
    "BORROW",
    "JOIN_STRATEGY",
  ];

  if (validTypes.includes(normalized as DefiOperationType)) {
    return normalized as DefiOperationType;
  }

  return "SWAP";
};

export default function ConfigPanel({ node, nodes, onSave, onClose }: Props) {
  const fallbackPairs = node?.data?.action?.defi_pairs || [];

  const [requiredData, setRequiredData] = useState<any[]>([]);
  const [pairsLoading, setPairsLoading] = useState(false);

  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amount, setAmount] = useState("");
  const [estimate, setEstimate] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Use ref to track if we've already fetched for this action ID
  const fetchedActionIdRef = useRef<string | null>(null);

  const edges = useEdges();
  const incomingEdge = edges.find((e) => e.target === node.id);
  const prevNode = nodes.find((n) => n.id === incomingEdge?.source);
  const prevConfig = prevNode?.data?.config;

  const [isTokenInOpen, setIsTokenInOpen] = useState(false);
const [isTokenOutOpen, setIsTokenOutOpen] = useState(false);

  const resolvedType = useMemo<DefiOperationType>(() => {
    const raw =
      node?.data?.action?.type ||
      node?.data?.action?.operation_type ||
      node?.data?.action?.name;

    return normalizeOperationType(raw);
  }, [node?.data?.action]);

  const isSwap = resolvedType === "SWAP";
  const isSupply = resolvedType === "SUPPLY";
  const isBorrow = resolvedType === "BORROW";
  const isJoinStrategy = resolvedType === "JOIN_STRATEGY";

  const requiresTokenOut = isSwap || isBorrow || isJoinStrategy;

  /**
   * Fetch required action data (only once per action ID)
   */
  useEffect(() => {
    const actionId = node?.data?.action?.id;
    if (!actionId) return;
    
    // Skip if already fetched this action ID
    if (fetchedActionIdRef.current === actionId) return;

    const fetchRequired = async () => {
      try {
        setPairsLoading(true);
        const res = await getRequiredActionData(actionId);
        setRequiredData(Array.isArray(res) ? res : []);
        fetchedActionIdRef.current = actionId; // Mark as fetched
      } catch (err) {
        console.error("Failed to fetch required action data:", err);
        setRequiredData([]);
      } finally {
        setPairsLoading(false);
      }
    };

    fetchRequired();
  }, [node?.data?.action?.id]);

  /**
   * Pairs from API -> fallback node data
   */
  const pairs = useMemo<DefiPair[]>(() => {
    return fallbackPairs;
  }, [requiredData, fallbackPairs]);

  /**
   * Unique token in options
   */
  const tokenInOptions = useMemo(() => {
    const map = new Map<string, NonNullable<DefiPair["token_in"]>>();
    pairs.forEach((p: DefiPair) => {
      if (p?.token_in?.id && !map.has(p.token_in.id)) {
        map.set(p.token_in.id, p.token_in);
      }
    });

    return Array.from(map.values());
  }, [pairs]);

  /**
   * Token out options by tokenIn
   */
  const tokenOutOptions = useMemo(() => {
    const map = new Map<string, NonNullable<DefiPair["token_out"]>>();
    pairs
      .filter((p: DefiPair) => p?.token_in?.id === tokenIn && p?.token_out?.id)
      .forEach((p: DefiPair) => {
        if (p?.token_out?.id && !map.has(p.token_out.id)) {
          map.set(p.token_out.id, p.token_out);
        }
      });

    console.log(pairs);

    return Array.from(map.values());
  }, [pairs, tokenIn]);

  const selectedPair = useMemo(() => {
    if (requiresTokenOut) {
      return pairs.find(
        (p: DefiPair) =>
          p?.token_in?.id === tokenIn && p?.token_out?.id === tokenOut,
      );
    }

    return pairs.find((p: DefiPair) => p?.token_in?.id === tokenIn);
  }, [pairs, tokenIn, tokenOut, requiresTokenOut]);

  useEffect(() => {
    if (!pairs.length) return;

    const config = node?.data?.config;

    // Restore existing config
    if (config?.tokenInPairId || config?.tokenInId) {
      let matchedPair: DefiPair | undefined;

      if (config?.tokenInPairId) {
        matchedPair = pairs.find(
          (p: DefiPair) =>
            p?.token_in?.id === config.tokenInPairId &&
            (!config?.tokenOutPairId || p?.token_out?.id === config.tokenOutPairId),
        );
      }

      if (!matchedPair && config?.tokenInId) {
        matchedPair = pairs.find(
          (p: DefiPair) =>
            p?.token_in?.asset_id === config.tokenInId &&
            (!config?.tokenOutId || p?.token_out?.asset_id === config.tokenOutId),
        );
      }

      const fallbackPair = matchedPair || pairs[0];

      if (fallbackPair?.token_in?.id) {
        setTokenIn(fallbackPair.token_in.id);
      }

      if (requiresTokenOut) {
        if (fallbackPair?.token_out?.id) {
          setTokenOut(fallbackPair.token_out.id);
        } else {
          setTokenOut("");
        }
      } else {
        setTokenOut("");
      }

      setAmount(config?.amount?.toString?.() || "");
      setEstimate(config?.estimate || null);
      
      // Mark initialization complete after restoring config
      setTimeout(() => setIsInitializing(false), 100);
      return;
    }

    // Autofill from previous node
    if (prevConfig) {
      const prevOutputTokenId = prevConfig?.tokenOutId || prevConfig?.tokenInId;
      const prevOutputAmount = prevConfig?.amountOut ?? prevConfig?.amount;

      if (prevOutputTokenId) {
        let pair = pairs.find(
          (p: DefiPair) => p?.token_in?.asset_id === prevOutputTokenId,
        );

        if (!pair) {
          pair = pairs[0];
        }

        if (pair?.token_in?.id) setTokenIn(pair.token_in.id);

        if (requiresTokenOut) {
          if (pair?.token_out?.id) {
            setTokenOut(pair.token_out.id);
          } else {
            setTokenOut("");
          }
        } else {
          setTokenOut("");
        }

        if (prevOutputAmount != null) {
          setAmount(String(prevOutputAmount));
        }

        // Mark initialization complete after autofill
        setTimeout(() => setIsInitializing(false), 100);
        return;
      }
    }

    // Default first pair
    if (pairs[0]?.token_in?.id) setTokenIn(pairs[0].token_in.id);

    if (requiresTokenOut) {
      if (pairs[0]?.token_out?.id) {
        setTokenOut(pairs[0].token_out.id);
      } else {
        setTokenOut("");
      }
    } else {
      setTokenOut("");
    }

    // Mark initialization complete after setting defaults
    setTimeout(() => setIsInitializing(false), 100);
  }, [pairs, node?.data?.config, prevConfig, requiresTokenOut]);

  /**
   * Keep tokenOut valid when tokenIn changes
   */
  useEffect(() => {
    if (!requiresTokenOut || !tokenIn) return;

    const validPair = pairs.find(
      (p: DefiPair) =>
        p?.token_in?.id === tokenIn && p?.token_out?.id === tokenOut,
    );

    if (!validPair) {
      const firstPair = pairs.find((p: DefiPair) => p?.token_in?.id === tokenIn);

      if (firstPair?.token_out?.id) {
        setTokenOut(firstPair.token_out.id);
      } else {
        setTokenOut("");
      }
    }
  }, [tokenIn, tokenOut, pairs, requiresTokenOut]);

  const isValid =
    amount !== "" &&
    Number(amount) > 0 &&
    !!tokenIn &&
    (!requiresTokenOut || !!tokenOut) &&
    estimate !== null;

  const handleAmountChange = (value: string) => {
    
    if (value === "") {
      setAmount("");
      setEstimate(null);
      setError("");
      return;
    }

    setAmount(value);

    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue <= 0 && value !== "0" && !value.startsWith("0.")) {
      setError("Amount must be greater than 0");
      setEstimate(null);
    } else {
      setError("");
    }
  };

  /**
   * Estimate only for preview
   */
  const handleEstimate = async () => {
    if (!amount || Number(amount) <= 0 || !tokenIn) {
      setEstimate(null);
      return;
    }

    if (requiresTokenOut && !tokenOut) {
      setEstimate(null);
      return;
    }

    try {
      setEstimating(true);

      const payload: EstimateDefiOperationPayload = {
        operation_type: resolvedType,
        token_in_id: tokenIn,
        amount_in: Number(amount),
        module_id: node?.data?.module?.id,
        action_id: node?.data?.action?.id,
      };

      if (requiresTokenOut && tokenOut) {
        payload.token_out_id = tokenOut;
      }

      const res = await estimateDefiOperation(payload);

      setEstimate(res);
    } catch (err) {
      console.error("CONFIG PANEL ESTIMATE ERROR:", err);
      setEstimate(null);
    } finally {
      setEstimating(false);
    }
  };

  /**
   * Auto estimate when enough data (with debounce and initialization check)
   */
  useEffect(() => {
    // Skip if still initializing
    if (isInitializing) {
      return;
    }

    if (!amount || Number(amount) <= 0 || !tokenIn) {
      setEstimate(null);
      return;
    }

    if (requiresTokenOut && !tokenOut) {
      setEstimate(null);
      return;
    }

    // Debounce: wait 500ms after user stops typing
    const timeoutId = setTimeout(async () => {
      try {
        setEstimating(true);

        const payload: EstimateDefiOperationPayload = {
          operation_type: resolvedType,
          token_in_id: tokenIn,
          amount_in: Number(amount),
          module_id: node?.data?.module?.id,
          action_id: node?.data?.action?.id,
        };

        if (requiresTokenOut && tokenOut) {
          payload.token_out_id = tokenOut;
        }

        const res = await estimateDefiOperation(payload);
        setEstimate(res);
      } catch (err) {
        console.error("CONFIG PANEL ESTIMATE ERROR:", err);
        setEstimate(null);
      } finally {
        setEstimating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    
  }, [amount, tokenIn, tokenOut, resolvedType, requiresTokenOut, isInitializing, node?.data?.module?.id, node?.data?.action?.id]);

  const handleSubmit = async () => {
    if (!isValid) return;

    const tokenInMeta =
      selectedPair?.token_in || tokenInOptions.find((t) => t.id === tokenIn);

    const tokenOutMeta =
      selectedPair?.token_out || tokenOutOptions.find((t) => t.id === tokenOut);

    const getAmountOut = () => {
      switch (resolvedType) {
        case "SWAP":
          return (
            estimate?.amount_out ??
            estimate?.output_amount ??
            estimate?.result_amount ??
            estimate?.received_amount ??
            null
          );

        case "JOIN_STRATEGY":
          return (
            estimate?.amount_out ??
            estimate?.output_amount ??
            estimate?.result_amount ??
            estimate?.received_amount ??
            estimate?.shares_out ??
            null
          );

        case "SUPPLY":
         
          return null;

        case "BORROW":
          return (
            estimate?.borrow_amount ??
            estimate?.amount_out ??
            estimate?.output_amount ??
            estimate?.received_amount ??
            null
          );

        default:
          return null;
      }
    };

    const getApy = () => {
      switch (resolvedType) {
        case "SUPPLY":
        case "JOIN_STRATEGY":
          return estimate?.supply_apy ?? estimate?.apy ?? null;

        case "BORROW":
          return estimate?.borrow_apy ?? estimate?.apy ?? null;

        default:
          return estimate?.apy ?? null;
      }
    };

    const payload = {
      nodeId: node.id,
      moduleId: node.data.module.id,
      actionId: node.data.action.id,
      operationType: resolvedType,

      tokenInPairId: tokenIn || undefined,
      tokenOutPairId: requiresTokenOut ? tokenOut || undefined : undefined,

      tokenInId: tokenInMeta?.asset_id || tokenIn,
      tokenOutId: requiresTokenOut
        ? tokenOutMeta?.asset_id || tokenOut
        : undefined,

      tokenInSymbol: tokenInMeta?.name || "",
      tokenOutSymbol: requiresTokenOut ? tokenOutMeta?.name || "" : "",

      amount: Number(amount),

      // raw preview estimate
      estimate,

      // normalized compatibility fields
      amountOut: getAmountOut(),
      slippage: estimate?.slippage ?? null,
      apy: getApy(),
      ltv: estimate?.ltv ?? estimate?.max_ltv ?? null,
    };

    try {
      setLoading(true);
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("CONFIG PANEL SAVE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderEstimate = () => {
    if (!estimate) return null;

    const cardBaseStyle = "glass border p-5 rounded-2xl relative overflow-hidden group animate-in zoom-in-95 duration-300";

    if (isSwap) {
      return (
        <div className={`${cardBaseStyle} bg-primary/5 border-primary/20`}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary blur-xl" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Estimated Output</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-white leading-none">
              {Number(estimate?.amount_out ?? estimate?.output_amount ?? 0).toFixed(6)}
            </p>
            <p className="text-sm font-medium text-primary/80">{selectedPair?.token_out?.name}</p>
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t border-white/5 text-[11px]">
            <span className="text-muted">Max Slippage</span>
            <span className="text-white font-mono">{((estimate?.slippage || 0) * 100).toFixed(2)}%</span>
          </div>
        </div>
      );
    }

    if (isSupply) {
      return (
        <div className={`${cardBaseStyle} bg-primary/5 border-primary/20`}>
          <div className="absolute -bottom-2 -right-2 p-3 opacity-10">
            <div className="w-16 h-16 rounded-full bg-primary blur-2xl" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Supply Strategy</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-white leading-none">
              {Number(estimate?.supply_apy ?? estimate?.apy ?? 0).toFixed(2)}%
            </p>
            <p className="text-xs text-muted mt-2 tracking-wide font-medium">ESTIMATED NET APY</p>
          </div>
        </div>
      );
    }

    if (isBorrow) {
      return (
        <div className={`${cardBaseStyle} bg-secondary/10 border-secondary/30`}>
          <p className="text-[10px] uppercase tracking-widest text-secondary-light font-bold">Borrow Details</p>
          
          <div className="space-y-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Amount Out</span>
              <span className="text-sm font-bold text-white">
                {Number(estimate?.borrow_amount ?? estimate?.amount_out ?? 0).toFixed(4)} {selectedPair?.token_out?.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Borrow APY</span>
              <span className="text-sm font-bold text-red-400">
                {Number(estimate?.borrow_apy ?? estimate?.apy ?? 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-xs text-muted">LTV Ratio</span>
              <span className="text-sm font-bold text-primary">
                {Number(estimate?.ltv ?? estimate?.max_ltv ?? 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (isJoinStrategy) {
      return (
        <div className={`${cardBaseStyle} bg-primary/10 border-primary/30 ocean-glow`}>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Strategy Entry</p>
          <div className="mt-3">
             <div className="text-2xl font-bold text-white">
               {Number(estimate?.amount_out ?? 0).toFixed(6)}
               <span className="text-xs ml-2 text-primary/70">SHARES</span>
             </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-white/5">
            <div>
              <p className="text-muted uppercase">APY</p>
              <p className="text-white font-bold">{Number(estimate?.supply_apy ?? estimate?.apy ?? 0).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-muted uppercase">Slippage</p>
              <p className="text-white font-bold">{((estimate?.slippage ?? 0) * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40"
      />

      <div
        className="
          fixed
          right-8
          top-[56%] -translate-y-1/2
          w-[360px]
          h-[600px]
          rounded-2xl
          glass
          border border-white/10
          shadow-[0_20px_50px_rgba(0,0,0,0.5)]
          z-50
          flex flex-col
          overflow-hidden
          animate-in fade-in slide-in-from-right-10 duration-300
        "
      >
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-start">
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
            className="text-neutral-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scroll">
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
            {/* --- TOKEN IN SECTION --- */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">
                  Token In
                </label>

                {/* CUSTOM DROPDOWN CHO TOKEN IN */}
                <div className="relative">
                  <button
                    type="button"
                    disabled={!!incomingEdge}
                    onClick={() => setIsTokenInOpen(!isTokenInOpen)}
                    className="
                      w-full flex items-center justify-between pl-4 pr-10 py-3.5 rounded-2xl 
                      bg-white/[0.03] border border-white/10 text-white
                      hover:bg-white/[0.07] hover:border-white/20 transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden bg-neutral-800 flex items-center justify-center relative shadow-sm">
                        {(() => {
                          const selectedToken = tokenInOptions.find((t: any) => t.id === tokenIn);
                          const symbol = selectedToken?.name || "";
                          const iconSrc = assetIcons[symbol];
                          return iconSrc ? (
                            <Image src={iconSrc} alt={symbol} fill sizes="24px" className="object-cover scale-110" />
                          ) : (
                            <span className="text-[10px] font-bold text-primary">{symbol.charAt(0) || "T"}</span>
                          );
                        })()}
                      </div>
                      <span className="text-sm font-medium">
                        {tokenInOptions.find((t: any) => t.id === tokenIn)?.name || "Select Token"}
                      </span>
                    </div>
                    <div className={`transition-transform duration-200 ${isTokenInOpen ? 'rotate-180' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </button>

                  {/* Menu List */}
                  {isTokenInOpen && !incomingEdge && (
                    <>
                      <div className="fixed inset-0 z-[60]" onClick={() => setIsTokenInOpen(false)} />
                      <div className="absolute top-full left-0 w-full mt-2 py-2 bg-[#141420] border border-white/10 rounded-2xl shadow-2xl z-[70] max-h-[200px] overflow-y-auto custom-scroll">
                        {tokenInOptions.map((token: any) => {
                          const iconSrc = assetIcons[token.name];
                          return (
                            <div
                              key={token.id}
                              onClick={() => {
                                setTokenIn(token.id);
                                setIsTokenInOpen(false);
                              }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full border border-white/10 overflow-hidden bg-neutral-900 flex items-center justify-center relative">
                                {iconSrc ? (
                                  <Image src={iconSrc} alt={token.name} fill sizes="20px" className="object-cover" />
                                ) : (
                                  <span className="text-[8px] font-bold">{token.name.charAt(0)}</span>
                                )}
                              </div>
                              <span className="text-sm text-white">{token.name}</span>
                              {tokenIn === token.id && <div className="ml-auto w-1 h-1 rounded-full bg-primary animate-pulse" />}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <input
                  type="text"
                  value={amount}
                  disabled={!!incomingEdge}
                  placeholder="0.00"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    if (val.split('.').length > 2) return;
                    handleAmountChange(val);
                  }}
                  className="
                    w-full px-5 py-4 rounded-2xl 
                    bg-white/[0.03] border border-white/10 
                    text-white text-2xl font-semibold
                    placeholder:text-white/20
                    focus:outline-none focus:ring-2 focus:ring-primary/40
                    transition-all
                  "
                />
                {error && <p className="text-red-400 text-[11px] ml-1">{error}</p>}
              </div>

              {/* --- TOKEN OUT SECTION --- */}
              {requiresTokenOut && (
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">
                    Token Out
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTokenOutOpen(!isTokenOutOpen)}
                      className="w-full flex items-center justify-between pl-4 pr-10 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.07] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden bg-neutral-800 flex items-center justify-center relative">
                          {(() => {
                            const selectedToken = tokenOutOptions.find((t: any) => t.id === tokenOut);
                            const symbol = selectedToken?.name || "";
                            const iconSrc = assetIcons[symbol];
                            return iconSrc ? (
                              <Image src={iconSrc} alt={symbol} fill sizes="24px" className="object-cover scale-110" />
                            ) : (
                              <span className="text-[10px] font-bold text-secondary">{symbol.charAt(0) || "T"}</span>
                            );
                          })()}
                        </div>
                        <span className="text-sm font-medium">
                          {tokenOutOptions.find((t: any) => t.id === tokenOut)?.name || "Select Token"}
                        </span>
                      </div>
                      <div className={`transition-transform duration-200 ${isTokenOutOpen ? 'rotate-180' : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </button>

                    {isTokenOutOpen && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsTokenOutOpen(false)} />
                        <div className="absolute top-full left-0 w-full mt-2 py-2 bg-[#141420] border border-white/10 rounded-2xl shadow-2xl z-[70] max-h-[200px] overflow-y-auto custom-scroll">
                          {tokenOutOptions.map((token: any) => {
                            const iconSrc = assetIcons[token.name];
                            return (
                              <div
                                key={token.id}
                                onClick={() => {
                                  setTokenOut(token.id);
                                  setIsTokenOutOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                              >
                                <div className="w-5 h-5 rounded-full border border-white/10 overflow-hidden bg-neutral-900 flex items-center justify-center relative">
                                  {iconSrc ? (
                                    <Image src={iconSrc} alt={token.name} fill sizes="20px" className="object-cover" />
                                  ) : (
                                    <span className="text-[8px] font-bold">{token.name.charAt(0)}</span>
                                  )}
                                </div>
                                <span className="text-sm text-white">{token.name}</span>
                                {tokenOut === token.id && <div className="ml-auto w-1 h-1 rounded-full bg-secondary animate-pulse" />}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {estimating && (
                <div className="text-sm text-neutral-500 bg-[#141420] p-4 rounded-xl border border-white/10">
                  Estimating...
                </div>
              )}

              {renderEstimate()}
            </>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={handleSubmit}
            className="
              defi-btn-glass w-full py-4 ocean-glow
              hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-30 disabled:hover:scale-100
              transition-all duration-300
              text-base
            "
          >
            {loading ? "Processing..." : "Confirm & Save"}
          </button>
        </div>
      </div>
    </>
  );
}