"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { usePreloader } from "@/providers/preloader-provider";
import { displayToast } from "@/components/shared/toast-manager";
import { useStrategyPrompt } from "@/hooks/use-strategy-prompt";
import { StrategyFlowPreview } from "@/components/strategy/StrategyFlowPreview";
import { StrategyFlowSkeleton } from "@/components/strategy/StrategyFlowSkeleton";
import { PromptTokenAmountField } from "./components/prompt-token-amount-field";
import { PromptStrategyGuide } from "./components/prompt-strategy-guide";
import dynamic from "next/dynamic";

const ExecutionModal = dynamic(
  () => import("@/components/shared/execution-modal").then((m) => m.ExecutionModal),
  { ssr: false },
);

const MAX_PROMPT_LENGTH = 2000;

export default function PromptPage() {
  const { show, hide } = usePreloader();

  const [isExecutionOpen, setIsExecutionOpen] = useState(false);
  const [strategyToExecute, setStrategyToExecute] = useState<any>(null);
  // Inline errors sit next to the field that caused them; the toast alone left
  // the user hunting for which input was wrong.
  const [fieldError, setFieldError] = useState<"token" | "amount" | "prompt" | null>(null);

  const {
    tokens,
    loading,
    submitting,
    strategyResult,
    selectedToken,
    tokenAmount,
    prompt,
    setSelectedToken,
    setTokenAmount,
    setPrompt,
    onCancel,
    onNext,
  } = useStrategyPrompt();

  const charCount = useMemo(() => prompt.length, [prompt]);

  useEffect(() => {
    if (loading) show();
    else hide();
  }, [loading, show, hide]);

  // Hide loader when component mounts (after navigation)
  useEffect(() => {
    hide();
  }, [hide]);

  const validatePromptForm = () => {
    if (!selectedToken) {
      setFieldError("token");
      displayToast("error", "Select a starting token.");
      return false;
    }

    if (!tokenAmount || tokenAmount <= 0) {
      setFieldError("amount");
      displayToast("error", "Enter an amount greater than zero.");
      return false;
    }

    if (!prompt.trim()) {
      setFieldError("prompt");
      displayToast("error", "Describe the strategy you want.");
      return false;
    }

    setFieldError(null);
    return true;
  };

  const handleNext = async () => {
    if (!validatePromptForm()) return;
    await onNext();
  };

  const handleRunStrategyClick = () => {
    if (!strategyResult) return;
    setStrategyToExecute(strategyResult);
    setIsExecutionOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-6">
      {/* Header sits left-aligned above the whole layout rather than inside the
          card, so the page has one clear entry point. */}
      <header className="max-w-[52ch] space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-light">
          Prompt builder
        </p>
        <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
          Describe a strategy, get a flow
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Pick what you are starting with, say what you want to happen, and the
          generated steps appear on the right before anything is executed.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-border bg-surface-1 p-6 md:p-8">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Starting position</h2>
              <PromptTokenAmountField
                tokens={tokens}
                selectedToken={selectedToken}
                tokenAmount={tokenAmount}
                onSelectToken={(value) => {
                  setSelectedToken(value);
                  setFieldError(null);
                }}
                onChangeAmount={(value) => {
                  setTokenAmount(value);
                  setFieldError(null);
                }}
              />
              {fieldError === "token" && (
                <p className="text-xs text-destructive">Select a starting token.</p>
              )}
              {fieldError === "amount" && (
                <p className="text-xs text-destructive">
                  Enter an amount greater than zero.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="strategy-prompt" className="text-sm font-semibold text-foreground">
                  What should happen
                </label>
                <span className="text-xs tabular-nums text-muted-foreground-subtle">
                  {charCount}/{MAX_PROMPT_LENGTH}
                </span>
              </div>

              <textarea
                id="strategy-prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setFieldError(null);
                }}
                maxLength={MAX_PROMPT_LENGTH}
                aria-invalid={fieldError === "prompt"}
                placeholder="Supply DOT as collateral, borrow USDC against it, then loop twice."
                className="h-40 w-full resize-none rounded-xl border border-border bg-surface-1 p-4 text-[15px] leading-relaxed text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground-subtle/70 hover:border-border-strong focus:border-accent-light/60 aria-[invalid=true]:border-destructive/60"
              />
              {fieldError === "prompt" && (
                <p className="text-xs text-destructive">
                  Describe the strategy you want.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition-all duration-200 hover:bg-accent-light active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {submitting ? "Generating" : "Generate strategy"}
            </button>
          </div>
        </section>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {submitting ? (
            <StrategyFlowSkeleton />
          ) : strategyResult ? (
            <StrategyFlowPreview
              strategy={strategyResult}
              selectedToken={selectedToken}
              onRunStrategy={handleRunStrategyClick}
            />
          ) : (
            <PromptStrategyGuide tokens={tokens} onPickExample={setPrompt} />
          )}
        </div>
      </div>

      {strategyToExecute && (
        <ExecutionModal
          open={isExecutionOpen}
          onOpenChange={setIsExecutionOpen}
          strategy={strategyToExecute}
          strategyId={String(strategyToExecute.id)}
          startFromStep={0}
          activityId={null}
        />
      )}
    </div>
  );
}
