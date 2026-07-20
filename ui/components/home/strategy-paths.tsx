"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TrendingUp, Droplets, Target, ArrowLeftRight, ArrowRight } from "lucide-react"

/**
 * Strategy categories.
 *
 * The old version rendered four equal cards, three of which were unreleased.
 * Those three were dimmed to opacity-60 yet still carried `cursor-pointer`,
 * a tooltip trigger, and a hover handler — and revealed their "Coming soon"
 * label by *blurring their own content* on hover, so pointing at a card hid
 * the information you were pointing at.
 *
 * Now the one shipped path gets the emphasis and the unreleased ones are
 * static, clearly-labelled tiles that no longer compete for the click.
 */

const livePath = {
  icon: TrendingUp,
  title: "Yield boost",
  description: "Compound rewards automatically to lift effective APY over time.",
  href: "/",
}

const upcomingPaths = [
  { icon: Droplets, title: "Liquidity farming", note: "Earn trading fees across chains" },
  { icon: Target, title: "Point campaigns", note: "Farm ecosystem incentive points" },
  { icon: ArrowLeftRight, title: "Cross-chain arbitrage", note: "Capture spreads between chains" },
]

export function StrategyPaths() {
  return (
    <section aria-labelledby="paths-heading" className="space-y-4">
      <h2
        id="paths-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        Strategy types
      </h2>

      {/* Asymmetric on purpose: the available path takes the wide cell, the
          three upcoming ones stack beside it instead of forming the generic
          four-equal-column feature row. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={livePath.href}
            className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-accent/30 bg-accent/[0.07] p-5 transition-colors hover:border-accent/60 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div>
              <div className="mb-4 grid size-10 place-items-center rounded-lg bg-accent/15">
                <livePath.icon className="w-5 h-5 text-accent-light" aria-hidden />
              </div>
              <h3 className="font-semibold text-base text-foreground">{livePath.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-[38ch]">
                {livePath.description}
              </p>
            </div>
            {/* Pinned to the bottom so the CTA holds a clean baseline
                regardless of how long the description runs. */}
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light">
              Browse strategies
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        </motion.div>

        <ul className="grid gap-3 content-start">
          {upcomingPaths.map((path, i) => (
            <motion.li
              key={path.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 * (i + 1), ease: [0.22, 1, 0.36, 1] }}
              // Not a button and not focusable: there is nothing to activate,
              // so it should not appear in the tab order at all.
              className="flex items-center gap-3 rounded-lg border border-border bg-surface-1 px-4 py-3"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-2">
                <path.icon className="w-4 h-4 text-muted-foreground" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground/90 truncate">{path.title}</p>
                <p className="text-xs text-muted-foreground truncate">{path.note}</p>
              </div>
              {/* Static label. State a card is in should not require hovering
                  it to discover. */}
              <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
