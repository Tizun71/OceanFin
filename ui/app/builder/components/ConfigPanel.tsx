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
import type { Token } from "@/types/defi";
import Image from "next/image";
import { resolveAssetIcon } from "@/lib/iconMap";

interface Props {
  node: Node<any>;
  nodes: Node<any>[];
  onSave: (payload: any, opts?: { silent?: boolean }) => void | Promise<void>;
  onClose: () => void;
}

// Pairs come back from the API with their tokens embedded; reuse the shared
// Token shape so EVM fields (address/decimals) stay in one place.
type DefiPair = {
  token_in?: Partial<Token>;
  token_out?: Partial<Token>;
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

  // Signature of the config last persisted to the node. Auto-save is skipped
  // while this matches the current selection, and it drives the "Saved" chip.
  const [savedSig, setSavedSig] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState("");
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
        // EVM tokens have no Hydration asset_id, so the previous step carries a
        // token id instead. Match either so a chained borrow inherits exactly
        // the collateral that was supplied, not pairs[0].
        let pair = pairs.find(
          (p: DefiPair) =>
            p?.token_in?.asset_id === prevOutputTokenId ||
            p?.token_in?.id === prevOutputTokenId,
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
   * Single source of truth for running an estimate — used both by the manual
   * trigger and the debounced auto-estimate so the payload never drifts.
   * Surfaces the backend error message instead of silently blanking the panel.
   */
  const runEstimate = async () => {
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
      setEstimateError("");

      const payload: EstimateDefiOperationPayload = {
        operation_type: resolvedType,
        token_in_id: tokenIn,
        amount_in: Number(amount),
        module_id: node?.data?.module?.id,
        action_id: node?.data?.action?.id,
        protocol: node?.data?.module?.protocol,
      };

      if (requiresTokenOut && tokenOut) {
        payload.token_out_id = tokenOut;
      }

      const res = await estimateDefiOperation(payload);
      setEstimate(res);
    } catch (err: any) {
      console.error("CONFIG PANEL ESTIMATE ERROR:", err);
      setEstimate(null);
      setEstimateError(err?.message || "Failed to estimate this operation.");
    } finally {
      setEstimating(false);
    }
  };

  const handleEstimate = runEstimate;

  /**
   * Auto estimate when enough data (with debounce and initialization check)
   */
  useEffect(() => {
    if (isInitializing) return;

    if (!amount || Number(amount) <= 0 || !tokenIn || (requiresTokenOut && !tokenOut)) {
      setEstimate(null);
      setEstimateError("");
      return;
    }

    // Debounce: wait 500ms after user stops typing.
    const timeoutId = setTimeout(runEstimate, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, tokenIn, tokenOut, resolvedType, requiresTokenOut, isInitializing, node?.data?.module?.id, node?.data?.action?.id, node?.data?.module?.protocol]);

  // Identifies a unique, saveable selection. Auto-save fires once per change of
  // this signature, and the "Saved" chip lights when it matches what's stored.
  const currentSig = `${resolvedType}|${tokenIn}|${tokenOut}|${amount}`;
  const isSaved = isValid && savedSig === currentSig;

  const buildPayload = () => {
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

      // EVM execution metadata. Undefined for substrate tokens; without these
      // buildEvmStepPlan cannot encode an amount and throws at execution time.
      tokenInAddress: tokenInMeta?.address ?? undefined,
      tokenInDecimals: tokenInMeta?.decimals ?? undefined,
      tokenOutAddress: requiresTokenOut ? tokenOutMeta?.address ?? undefined : undefined,
      tokenOutDecimals: requiresTokenOut ? tokenOutMeta?.decimals ?? undefined : undefined,

      amount: Number(amount),

      // raw preview estimate
      estimate,

      // normalized compatibility fields
      amountOut: getAmountOut(),
      slippage: estimate?.slippage ?? null,
      apy: getApy(),
      ltv: estimate?.ltv ?? estimate?.max_ltv ?? null,
    };

    return payload;
  };

  /**
   * Auto-save: whenever a fresh estimate lands for a valid, not-yet-saved
   * selection, persist it to the node silently. Keyed off `estimate` so it only
   * runs on a real estimate (never on stale inputs mid-typing), and deduped by
   * signature so re-opening a saved node doesn't rewrite it. No Save button.
   */
  useEffect(() => {
    if (isInitializing || estimating || !isValid || !estimate) return;
    if (currentSig === savedSig) return;

    onSave(buildPayload(), { silent: true });
    setSavedSig(currentSig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimate, estimating, isInitializing]);

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
            <p className="text-3xl font-bold text-foreground leading-none">
              {Number(estimate?.amount_out ?? estimate?.output_amount ?? 0).toFixed(6)}
            </p>
            <p className="text-sm font-medium text-primary/80">{selectedPair?.token_out?.name}</p>
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t border-white/5 text-[11px]">
            <span className="text-muted">Max Slippage</span>
            <span className="text-foreground font-mono">{((estimate?.slippage || 0) * 100).toFixed(2)}%</span>
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
            <p className="text-3xl font-bold text-foreground leading-none">
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
              <span className="text-sm font-bold text-foreground">
                {Number(estimate?.borrow_amount ?? estimate?.amount_out ?? 0).toFixed(4)} {selectedPair?.token_out?.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Borrow APY</span>
              <span className="text-sm font-bold text-destructive">
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
             <div className="text-2xl font-bold text-foreground">
               {Number(estimate?.amount_out ?? 0).toFixed(6)}
               <span className="text-xs ml-2 text-primary/70">SHARES</span>
             </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-white/5">
            <div>
              <p className="text-muted uppercase">APY</p>
              <p className="text-foreground font-bold">{Number(estimate?.supply_apy ?? estimate?.apy ?? 0).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-muted uppercase">Slippage</p>
              <p className="text-foreground font-bold">{((estimate?.slippage ?? 0) * 100).toFixed(2)}%</p>
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
        className="fixed inset-0 z-[var(--z-overlay)] bg-[rgba(0,12,18,0.45)] backdrop-blur-[1px]"
      />

      {/* Slide-over rather than a centred modal: the canvas behind it stays
          visible so the step being configured keeps its context. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Configure ${node.data.action.name}`}
        className="fixed right-6 top-1/2 z-[var(--z-modal)] flex h-[min(640px,calc(100dvh-8rem))] w-[380px] -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-[var(--shadow-lg)] backdrop-blur-xl animate-in fade-in slide-in-from-right-6 duration-300"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground-subtle">
              {node.data.module.name}
            </p>

            <h2 className="mt-1 truncate text-lg font-semibold text-foreground">
              {node.data.action.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration"
            className="rounded-md p-1 text-muted-foreground transition-colors duration-200 hover:bg-surface-2 hover:text-foreground"
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="custom-scroll flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {pairsLoading && (
            // Skeleton matches the shape of the controls it replaces instead of
            // a line of text that shifts layout when the real fields land.
            <div className="space-y-3" role="status" aria-label="Loading action requirements">
              <div className="h-3 w-20 animate-pulse rounded bg-surface-2" />
              <div className="h-[54px] animate-pulse rounded-2xl bg-surface-2" />
              <div className="h-[62px] animate-pulse rounded-2xl bg-surface-2" />
            </div>
          )}

          {!pairsLoading && pairs.length === 0 && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-destructive">
              This action has no token pairs configured on the current chain, so
              it can&apos;t be set up yet. Remove the step or pick another action.
            </p>
          )}

          {pairs.length > 0 && (
            <>
            {/* --- TOKEN IN SECTION --- */}
              <div className="space-y-3">
                <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground-subtle">
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
                      bg-surface-1 border border-border text-foreground
                      hover:bg-surface-2 hover:border-border-strong transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-border-strong overflow-hidden bg-surface-2 flex items-center justify-center relative shadow-sm">
                        {(() => {
                          const selectedToken = tokenInOptions.find((t: any) => t.id === tokenIn);
                          const symbol = selectedToken?.name || "";
                          const iconSrc = resolveAssetIcon(symbol);
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
                      <div className="fixed inset-0 z-[var(--z-overlay)]" onClick={() => setIsTokenInOpen(false)} />
                      <div className="absolute top-full left-0 w-full mt-2 py-2 bg-popover border border-border rounded-2xl shadow-[var(--shadow-lg)] z-[var(--z-modal)] max-h-[200px] overflow-y-auto custom-scroll">
                        {tokenInOptions.map((token: any) => {
                          const iconSrc = resolveAssetIcon(token.name);
                          return (
                            <div
                              key={token.id}
                              onClick={() => {
                                setTokenIn(token.id);
                                setIsTokenInOpen(false);
                              }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 cursor-pointer transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full border border-border overflow-hidden bg-surface-2 flex items-center justify-center relative">
                                {iconSrc ? (
                                  <Image src={iconSrc} alt={token.name} fill sizes="20px" className="object-cover" />
                                ) : (
                                  <span className="text-[8px] font-bold">{token.name.charAt(0)}</span>
                                )}
                              </div>
                              <span className="text-sm text-foreground">{token.name}</span>
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
                    bg-surface-1 border border-border 
                    text-foreground text-2xl font-semibold
                    placeholder:text-muted-foreground-subtle/60
                    focus:outline-none focus:ring-2 focus:ring-primary/40
                    transition-all
                  "
                />
                {error && <p className="text-destructive text-[11px] ml-1">{error}</p>}
              </div>

              {/* --- TOKEN OUT SECTION --- */}
              {requiresTokenOut && (
                <div className="space-y-3 pt-2">
                  <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground-subtle">
                    Token Out
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTokenOutOpen(!isTokenOutOpen)}
                      className="w-full flex items-center justify-between pl-4 pr-10 py-3.5 rounded-2xl bg-surface-1 border border-border text-foreground hover:bg-surface-2 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border border-border-strong overflow-hidden bg-surface-2 flex items-center justify-center relative">
                          {(() => {
                            const selectedToken = tokenOutOptions.find((t: any) => t.id === tokenOut);
                            const symbol = selectedToken?.name || "";
                            const iconSrc = resolveAssetIcon(symbol);
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
                        <div className="fixed inset-0 z-[var(--z-overlay)]" onClick={() => setIsTokenOutOpen(false)} />
                        <div className="absolute top-full left-0 w-full mt-2 py-2 bg-popover border border-border rounded-2xl shadow-[var(--shadow-lg)] z-[var(--z-modal)] max-h-[200px] overflow-y-auto custom-scroll">
                          {tokenOutOptions.map((token: any) => {
                            const iconSrc = resolveAssetIcon(token.name);
                            return (
                              <div
                                key={token.id}
                                onClick={() => {
                                  setTokenOut(token.id);
                                  setIsTokenOutOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 cursor-pointer transition-colors"
                              >
                                <div className="w-5 h-5 rounded-full border border-border overflow-hidden bg-surface-2 flex items-center justify-center relative">
                                  {iconSrc ? (
                                    <Image src={iconSrc} alt={token.name} fill sizes="20px" className="object-cover" />
                                  ) : (
                                    <span className="text-[8px] font-bold">{token.name.charAt(0)}</span>
                                  )}
                                </div>
                                <span className="text-sm text-foreground">{token.name}</span>
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
                <div
                  role="status"
                  aria-label="Estimating"
                  className="h-[92px] animate-pulse rounded-xl bg-surface-2"
                />
              )}

              {!estimating && estimateError && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
                >
                  {estimateError}
                </div>
              )}

              {!estimating && !estimateError && renderEstimate()}
            </>
          )}
        </div>

        <footer className="flex items-center gap-3 border-t border-border bg-surface-1 px-6 py-5">
          {/* Save is automatic — this chip tells the user the node is up to date
              instead of asking them to press a button every time. */}
          <div className="flex-1 text-xs font-medium" aria-live="polite">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Saved automatically
              </span>
            ) : estimating ? (
              <span className="text-muted-foreground">Estimating…</span>
            ) : isValid ? (
              <span className="text-muted-foreground">Saving…</span>
            ) : (
              <span className="text-muted-foreground-subtle">
                Pick tokens and an amount
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition-all duration-200 hover:bg-accent-light active:translate-y-px"
          >
            Done
          </button>
        </footer>
      </aside>
    </>
  );
}