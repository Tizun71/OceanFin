"use client"

import { ArrowDown, Bot, Coins, Repeat, DollarSign } from "lucide-react"
import { motion } from "framer-motion";
import { resolveAssetIcon } from "@/lib/iconMap";

interface TokenInfo {
  assetId?: string | number
  symbol?: string
  amount?: string | number | null
}

interface FlowStep {
  step: number
  type: string
  agent: string
  tokenIn?: TokenInfo | null
  tokenOut?: TokenInfo | null
}

interface StrategyFlowProps {
  steps?: FlowStep[]
  initialCapital?: TokenInfo
  loops?: number
  fee?: number
}

const iconFor = (symbol?: string) => resolveAssetIcon(symbol) || "/icons/default.png"

/** One side of a step: the token going in, or the token coming out. */
function TokenRow({
  token,
  direction,
}: {
  token: TokenInfo
  direction: "in" | "out"
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      {/* The two rows were styled identically, so "what went in" and "what came
          out" were told apart only by vertical position. */}
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {direction === "in" ? "In" : "Out"}
      </span>
      <span className="flex items-center gap-1.5 min-w-0">
        <span data-numeric className="text-sm text-foreground truncate">
          {token.amount ?? "—"}
        </span>
        <img
          src={iconFor(token.symbol)}
          alt=""
          aria-hidden
          className="w-4 h-4 shrink-0 rounded-full object-contain bg-white/95"
        />
        <span
          className={`text-sm font-medium ${
            direction === "out" ? "text-accent-light" : "text-foreground/80"
          }`}
        >
          {token.symbol || "—"}
        </span>
      </span>
    </div>
  )
}

export function StrategyFlow({
  steps = [],
  initialCapital,
  loops,
  fee,
}: StrategyFlowProps) {
  const validSteps = Array.isArray(steps) ? steps : []

  if (!validSteps.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
        No flow data yet. Run a simulation to generate the steps.
      </div>
    )
  }

  const stats = [
    {
      icon: Coins,
      label: "Initial capital",
      sub: "Base asset",
      value: (
        <span className="inline-flex items-center gap-1.5">
          <span data-numeric>{initialCapital?.amount ?? "0"}</span>
          {initialCapital?.symbol && (
            <img
              src={iconFor(initialCapital.symbol)}
              alt=""
              aria-hidden
              className="w-4 h-4 rounded-full object-contain bg-white/95"
            />
          )}
          <span>{initialCapital?.symbol || "—"}</span>
        </span>
      ),
    },
    { icon: Repeat, label: "Loops", sub: "Total cycles", value: <span data-numeric>{loops ?? "—"}</span> },
    { icon: DollarSign, label: "Fee", sub: "Execution cost", value: <span data-numeric>{fee ?? 0}</span> },
  ]

  return (
    <div>
      {/* The old header repeated "Strategy Flow" — the exact label of the tab
          the user had just clicked to get here. Only the step count is new
          information, so only that remains. */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Execution steps
        </h2>
        <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
          <span data-numeric className="font-medium text-foreground">{validSteps.length}</span> steps
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Steps. Was `items-center` with `max-w-[360px]` cards inside a 7-col
            cell, so the cards floated in the middle of a much wider column,
            and `max-h-[350px] overflow-y-auto` clipped the connector arrows
            that were positioned at -bottom-5. */}
        <ol className="lg:col-span-7 flex flex-col gap-0 min-w-0">
          {validSteps.map((step, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              <div className="rounded-lg border border-border bg-surface-1 p-3 transition-colors duration-200 hover:border-accent/40">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      data-numeric
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent-light"
                    >
                      {step.step}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {step.type}
                    </h3>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                    <Bot className="w-3.5 h-3.5" aria-hidden />
                    {step.agent || "—"}
                  </span>
                </div>

                {/* Rows render only when they exist. The previous version
                    always rendered all three slots and filled the empty ones
                    with `<span className="opacity-0">placeholder</span>` — a
                    spacer that screen readers still announced as the word
                    "placeholder", three times per step. */}
                <div className="divide-y divide-border border-t border-border">
                  {step.tokenIn && <TokenRow token={step.tokenIn} direction="in" />}
                  {step.tokenOut && <TokenRow token={step.tokenOut} direction="out" />}
                </div>
              </div>

              {/* Connector. Was `animate-bounce` on every arrow in the list
                  plus another inside each card — continuous motion carrying no
                  state, on a data view users need to read carefully. */}
              {idx < validSteps.length - 1 && (
                <div className="flex justify-center py-1" aria-hidden>
                  <ArrowDown className="w-4 h-4 text-border-strong" />
                </div>
              )}
            </motion.li>
          ))}
        </ol>

        {/* Stats */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="rounded-lg border border-border bg-surface-1">
            <h2 className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Summary
            </h2>

            <dl className="divide-y divide-border">
              {stats.map((info) => (
                <div key={info.label} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2">
                      <info.icon className="w-4 h-4 text-accent" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-sm font-medium text-foreground">{info.label}</dt>
                      <p className="text-[11px] text-muted-foreground">{info.sub}</p>
                    </div>
                  </div>
                  <dd className="shrink-0 text-sm font-semibold text-foreground">{info.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
