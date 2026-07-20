"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Circle, ExternalLinkIcon, Loader2Icon, XCircle } from "lucide-react";
import Image from "next/image";
import { ExecutionStep } from "./types";

interface StepStackProps {
  steps: ExecutionStep[];
  currentStep: number;
  allStepsCompleted: boolean;
  /** Base explorer URL for the chain the strategy is running on. */
  explorerUrl?: string;
  /** EVM explorers use /tx/, Substrate (Subscan) uses /extrinsic/. */
  isEvm?: boolean;
}

/**
 * Execution step list.
 *
 * Rewritten from an absolutely-positioned "card stack". The previous version:
 *  - Positioned every card with a hand-computed `yPosition` inside a container
 *    whose height was `steps.length * 100 + 50`px. Card content is variable,
 *    so any step whose title or token row wrapped to a second line overflowed
 *    into the next card's fixed 100px slot.
 *  - Reordered the whole stack on hover (cards above moved up 50px, below
 *    moved down 50px). Moving the mouse rearranged a live list of financial
 *    transactions under the user's cursor.
 *  - Ran a hand-rolled 800ms requestAnimationFrame scroll on every step
 *    change, which fought the user if they were scrolling and ignored
 *    prefers-reduced-motion entirely.
 *  - Painted `text-white` on `var(--accent)` (2.6:1) and on `var(--secondary)`,
 *    both below the WCAG AA threshold, with a gradient that faded the card
 *    background to near-transparent behind the lower half of that same text.
 *
 * It is now a plain vertical list in document flow: content sizes itself,
 * nothing moves on hover, and the active step is brought into view with the
 * browser's own scrollIntoView.
 */
export default function StepStack({
  steps,
  currentStep,
  allStepsCompleted,
  explorerUrl,
  isEvm,
}: StepStackProps) {
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "nearest",
    });
  }, [currentStep]);

  const txUrl = (hash: string) =>
    explorerUrl ? `${explorerUrl}/${isEvm ? "tx" : "extrinsic"}/${hash}` : undefined;

  return (
    <ol className="custom-scroll max-h-[46vh] space-y-2 overflow-y-auto py-1 pr-1">
      {steps.map((step, index) => {
        const isFailed = step.status === "failed";
        const isActive = index === currentStep && !allStepsCompleted && !isFailed;
        const isCompleted = index < currentStep || (allStepsCompleted && !isFailed);
        const url = step.txHash ? txUrl(step.txHash) : undefined;

        return (
          <li
            key={step.id ?? index}
            ref={isActive ? activeRef : undefined}
            // State is carried by border and a tinted surface rather than a
            // saturated fill, so the label stays at full contrast in every state.
            className={`rounded-lg border p-3 transition-colors duration-200 ${
              isFailed
                ? "border-destructive/40 bg-destructive/10"
                : isActive
                  ? "border-accent bg-accent/10"
                  : isCompleted
                    ? "border-success/30 bg-success/[0.07]"
                    : "border-border bg-surface-1"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isFailed ? (
                  <XCircle className="h-5 w-5 text-destructive" aria-hidden />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
                ) : isActive ? (
                  <Loader2Icon className="h-5 w-5 animate-spin text-accent-light" aria-hidden />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    <span className="text-muted-foreground mr-1.5 tabular">{index + 1}.</span>
                    {step.title}
                  </h3>

                  {isCompleted && url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      // Was an unlabelled icon pointing at hydration.subscan.io
                      // regardless of chain, so an Avalanche transaction linked
                      // to a Polkadot explorer that had never seen the hash.
                      aria-label={`View step ${index + 1} transaction on the block explorer (opens in a new tab)`}
                      className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ExternalLinkIcon className="h-4 w-4" aria-hidden />
                    </a>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {step.fromToken && step.fromAmount ? (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <Image
                          src={step.fromToken.icon}
                          alt=""
                          aria-hidden
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                        <span data-numeric className="font-medium text-foreground/90">
                          {step.fromAmount} {step.fromToken.symbol}
                        </span>
                      </span>
                      <span aria-hidden className="text-muted-foreground">
                        →
                      </span>
                    </>
                  ) : null}

                  {step.toToken && step.toAmount ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Image
                        src={step.toToken.icon}
                        alt=""
                        aria-hidden
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                      <span data-numeric className="font-medium text-foreground/90">
                        {step.toAmount} {step.toToken.symbol}
                      </span>
                    </span>
                  ) : null}

                  {!step.fromToken && !step.toToken && <span>{step.description}</span>}
                </div>

                {/* Was three animations stacked on one label: a spinning
                    loader, a scale pulse, and an infinite opacity fade on the
                    word "Executing". The spinner alone already says this. */}
                {isActive && (
                  <p className="mt-2 text-xs font-medium text-accent-light">Executing…</p>
                )}
                {isFailed && (
                  <p className="mt-2 text-xs font-medium text-destructive">
                    This step failed. Close and try again.
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
