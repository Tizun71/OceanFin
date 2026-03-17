"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Lightbulb, Sparkles } from "lucide-react";
import { usePreloader } from "@/providers/preloader-provider";
import { displayToast } from "@/components/shared/toast-manager";
import { useStrategyPrompt } from "@/hooks/use-strategy-prompt";
import { StrategyFlowPreview } from "@/components/strategy/StrategyFlowPreview";
import { assetIcons } from "@/lib/iconMap";

function Prompt() {
  const { show, hide } = usePreloader();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    tokens,
    loading,
    submitting,
    strategyResult,
    selectedToken,
    prompt,
    setSelectedToken,
    setPrompt,
    onCancel,
    onNext,
  } = useStrategyPrompt();

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const charCount = useMemo(() => prompt.length, [prompt]);

  useEffect(() => {
    if (loading) {
      show();
    } else {
      hide();
    }
  }, [loading, show, hide]);

  // Hide loader when component mounts (after navigation)
  useEffect(() => {
    hide();
  }, [hide]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.token-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const validatePromptForm = () => {
    if (!selectedToken) {
      displayToast("error", "Please select a starting token.");
      return false;
    }

    if (!prompt.trim()) {
      displayToast("error", "Please enter your strategy prompt.");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validatePromptForm()) return;
    await onNext();
  };

  const handleRunStrategy = () => {
    if (strategyResult) {
      // Store strategy for execution
      localStorage.setItem('strategyToExecute', JSON.stringify({
        name: `Strategy ${new Date().toLocaleString()}`,
        result: strategyResult,
        selectedToken,
        prompt,
      }));
      
      // Navigate to execution page
      window.location.href = "/execute";
    }
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

              <div className="relative w-full max-w-sm token-dropdown">
                {/* Custom Dropdown */}
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="
                    h-12 w-full cursor-pointer rounded-3xl
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
                    flex items-center gap-3
                  "
                >
                  {selectedToken ? (
                    <>
                      <img 
                        src={assetIcons[selectedToken] || 
                             assetIcons[selectedToken?.toUpperCase()] || 
                             assetIcons[selectedToken?.toLowerCase()] || 
                             "/icons/default.png"}
                        alt={selectedToken}
                        className="w-5 h-5 rounded-full object-contain bg-white border border-white/20"
                      />
                      <span>{tokens.find(t => t.value === selectedToken)?.label || selectedToken}</span>
                    </>
                  ) : (
                    <span className="text-white/60">Select starting token</span>
                  )}
                </div>

                <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
                  <ChevronDown className={`h-4 w-4 text-white/45 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-white/10 bg-[#1a1a1a] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
                    {tokens.map((token) => (
                      <div
                        key={token.value}
                        onClick={() => {
                          setSelectedToken(token.value);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-white hover:bg-white/[0.05] cursor-pointer transition-colors"
                      >
                        <img 
                          src={assetIcons[token.value] || 
                               assetIcons[token.value?.toUpperCase()] || 
                               assetIcons[token.value?.toLowerCase()] || 
                               "/icons/default.png"}
                          alt={token.value}
                          className="w-5 h-5 rounded-full object-contain bg-white border border-white/20"
                        />
                        <span>{token.label}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                  placeholder="Example: Create a gdot looping 3 loops, Supply DOT and borrow USDC, Maximize yield with moderate risk..."
                  className="h-[110px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Sparkles className="h-3 w-3" />
                    <span>AI-powered strategy generation</span>
                  </div>
                </div>
              </div>
            </section>
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
          {strategyResult ? (
            /* Strategy Flow Preview */
            <StrategyFlowPreview 
              strategy={strategyResult}
              selectedToken={selectedToken}
              onRunStrategy={handleRunStrategy}
            />
          ) : (
            /* Strategy Guide */
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-2 text-yellow-400">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-semibold">Strategy Guide</span>
                </div>

                {/* Guide Tips */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-white/70">Example Prompts:</h3>
                    <div className="space-y-1">
                      <div 
                        onClick={() => handleExampleClick("Create a gdot looping 3 loops")}
                        className="text-xs text-white/50 p-2 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] hover:text-white/70 transition-all"
                      >
                        "Create a gdot looping 3 loops"
                      </div>
                      <div 
                        onClick={() => handleExampleClick("Supply DOT and borrow USDC")}
                        className="text-xs text-white/50 p-2 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] hover:text-white/70 transition-all"
                      >
                        "Supply DOT and borrow USDC"
                      </div>
                      <div 
                        onClick={() => handleExampleClick("Maximize yield with moderate risk")}
                        className="text-xs text-white/50 p-2 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] hover:text-white/70 transition-all"
                      >
                        "Maximize yield with moderate risk"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/8 pt-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-white/70">Supported Operations:</h3>
                    <div className="grid grid-cols-2 gap-1 text-xs text-white/50">
                      <div className="p-1.5 rounded bg-white/[0.02]">Supply</div>
                      <div className="p-1.5 rounded bg-white/[0.02]">Borrow</div>
                      <div className="p-1.5 rounded bg-white/[0.02]">Swap</div>
                      <div className="p-1.5 rounded bg-white/[0.02]">Join Strategy</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/8 pt-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-white/70">Available Tokens:</h3>
                    <div className="flex flex-wrap gap-1">
                      {tokens.map((token) => (
                        <span 
                          key={token.value}
                          className="px-2 py-1 text-xs rounded-full bg-white/[0.05] text-white/60 border border-white/10"
                        >
                          {token.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PromptPage() {
  return <Prompt />;
}