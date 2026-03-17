"use client";

import { useEffect, useMemo } from "react";
import { ChevronDown, Lightbulb, Sparkles } from "lucide-react";
import { usePreloader } from "@/providers/preloader-provider";
import { displayToast } from "@/components/shared/toast-manager";
import { useStrategyPrompt } from "@/hooks/use-strategy-prompt";

const promptExamples = [
  "Swap and Bridge",
  "Lend and Borrow",
  "Buy PT/YT",
  "Long/Short Perp",
];

function Prompt() {
  const { show, hide } = usePreloader();

  const {
    tokens,
    loading,
    submitting,
    selectedToken,
    prompt,
    strategyName,
    setSelectedToken,
    setPrompt,
    setStrategyName,
    onCancel,
    onNext,
  } = useStrategyPrompt();

  const charCount = useMemo(() => prompt.length, [prompt]);

  useEffect(() => {
    if (loading) {
      show();
    } else {
      hide();
    }
  }, [loading, show, hide]);

  const validatePromptForm = () => {
    if (!selectedToken) {
      displayToast("error", "Please select a starting token.");
      return false;
    }

    if (!prompt.trim()) {
      displayToast("error", "Please enter your strategy prompt.");
      return false;
    }

    if (!strategyName.trim()) {
      displayToast("error", "Please enter your strategy name.");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validatePromptForm()) return;
    await onNext();
  };

  return (
    <div className="flex flex-1 min-h-[calc(100vh-120px)] items-center justify-center px-6 py-5 text-white">
      <div className="flex w-full max-w-7xl items-start justify-center gap-6">
        {/* LEFT FORM */}
        <div className="flex w-full max-w-[820px] flex-col rounded-3xl border border-white/10 bg-black/25 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="space-y-5">
            {/* Page Title */}
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Create Prompt Strategy
              </h1>
            </div>

            {/* Starting Token */}
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-white">Starting Token</h2>

              <div className="relative w-full max-w-sm">
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="
                    h-12 w-full appearance-none rounded-3xl
                    border border-white/10
                    bg-white/[0.05]
                    pl-5 pr-12
                    text-sm text-white
                    outline-none transition-all duration-200
                    backdrop-blur-xl
                    hover:border-white/15
                    hover:bg-white/[0.07]
                    focus:border-violet-500/40
                    focus:bg-white/[0.08]
                    shadow-[0_4px_20px_rgba(0,0,0,0.15)]
                  "
                >
                  <option value="" className="bg-[#1a1a1a] text-white">
                    Select starting token
                  </option>

                  {tokens.map((token) => (
                    <option
                      key={token.value}
                      value={token.value}
                      className="bg-[#1a1a1a] text-white"
                    >
                      {token.label}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
                  <ChevronDown className="h-4 w-4 text-white/45" />
                </div>
              </div>
            </section>

            {/* Strategy Prompt */}
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-medium text-white">
                  Strategy Prompt
                </h2>

                <span className="text-xs text-white/40">{charCount}/2000</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={2000}
                  placeholder="Example: Start with USDC, bridge to Arbitrum, lend on Aave, borrow ETH, then stake into yield protocol..."
                  className="h-[110px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    / Insert Smart Action
                  </button>
                </div>
              </div>
            </section>

            {/* Strategy Name */}
          </div>

          {/* ACTIONS */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="h-11 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white/65 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleNext}
              disabled={submitting}
              className="h-11 rounded-full border border-white/10 bg-white/[0.06] px-7 text-sm font-semibold text-white/80 transition hover:border-white/15 hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Generate Strategy"}
            </button>
          </div>
        </div>

        {/* RIGHT GUIDE PANEL */}
        <div className="w-[320px] shrink-0">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="text-sm font-semibold">Strategy Flow</span>
              </div>

              {/* Guide Tips */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                </div>

              </div>

              <div className="space-y-3 border-t border-white/8 pt-6">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromptPage() {
  return <Prompt />;
}