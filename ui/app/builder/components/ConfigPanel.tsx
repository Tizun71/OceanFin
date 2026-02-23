"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { estimateSwap } from "@/services/defi-module-service";
import { TOKEN_MAP } from "@/app/constants/tokens";

export default function ConfigPanel({ node, onSave, onClose }: any) {

  const [tokenIn, setTokenIn] = useState("USDC");
  const [tokenOut, setTokenOut] = useState("DOT");

  const [amount, setAmount] = useState("");

  const [estimate, setEstimate] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);

  const [error, setError] = useState("");

  const isValid =
    amount !== "" &&
    Number(amount) > 0 &&
    tokenIn !== tokenOut &&
    estimate !== null;

  const handleAmountChange = (value: string) => {
    // empty
    if (!value) {
      setAmount("");
      setEstimate(null);
      setError("");
      return;
    }

    // block negative and zero
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
    if (!amount || Number(amount) <= 0 || tokenIn === tokenOut) {
      setEstimate(null);
      return;
    }

    try {
      setEstimating(true);

      const res = await estimateSwap({
        token_in_id: TOKEN_MAP[tokenIn],
        token_out_id: TOKEN_MAP[tokenOut],
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
    setEstimate(null);

    if (!amount || Number(amount) <= 0) return;

    const timeout = setTimeout(() => {
      handleEstimate();
    }, 400);

    return () => clearTimeout(timeout);
  }, [amount, tokenIn, tokenOut]);

  const handleSubmit = async () => {
    if (!isValid) return;

    const payload = {
      nodeId: node.id,

      moduleId: node.data.module.id,

      actionId: node.data.action.id,

      tokenIn,
      tokenOut,

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <div
        className="
        fixed right-0 top-0 h-full w-[380px]
        bg-gradient-to-b from-[#141420] to-[#0f0f1a]
        border-l border-neutral-800
        shadow-2xl
        p-6
        z-50
        flex flex-col
      "
      >
        {/* Header */}
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-xs text-neutral-500 uppercase">
              {node.data.module.name}
            </p>

            <h2 className="text-lg font-semibold text-white">
              {node.data.action.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-6">
          {/* Token In */}
          <div>
            <label className="text-xs text-neutral-400">Token In</label>

            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl bg-[#1b1b2c]"
            >
              <option value="USDC">USDC</option>

              <option value="DOT">DOT</option>
            </select>

            {/* Amount */}
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              placeholder="Enter amount"
              onChange={(e) => handleAmountChange(e.target.value)}
              className="
                w-full mt-3 p-3 rounded-xl
                bg-[#1b1b2c]
                border border-neutral-800
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          {/* Token Out */}
          <div>
            <label className="text-xs text-neutral-400">Token Out</label>

            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl bg-[#1b1b2c]"
            >
              <option value="USDC" disabled={tokenIn === "USDC"}>
                USDC
              </option>

              <option value="DOT" disabled={tokenIn === "DOT"}>
                DOT
              </option>
            </select>
          </div>

          {/* Estimating */}
          {estimating && (
            <p className="text-sm text-neutral-500">
              Estimating...
            </p>
          )}

          {/* Result */}
          {estimate && (
            <div className="bg-[#1b1b2c] p-4 rounded-xl">
              <p className="text-xs text-neutral-400">
                Estimated Output
              </p>

              <p className="text-xl font-semibold text-white mt-1">
                {Number(estimate.amount_out).toFixed(6)} {tokenOut}
              </p>

              <p className="text-xs text-neutral-500 mt-1">
                Slippage: {(estimate.slippage * 100).toFixed(2)}%
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="
            mt-6
            w-full
            py-3
            rounded-xl
            font-semibold
            bg-indigo-600
            hover:bg-indigo-500
            disabled:opacity-50
          "
        >
          {loading ? "Creating..." : "Create Strategy"}
        </button>
      </div>
    </>
  );
}