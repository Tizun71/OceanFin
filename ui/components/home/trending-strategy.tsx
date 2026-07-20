"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { Card } from "@/components/ui/card"
import { fetchStrategies } from "@/services/strategy-service"

/** Compact icon stack, shared by the asset / agent / chain rows. */
function IconRow({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null
  const overflow = items.length - 3

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex -space-x-1.5">
        {items.slice(0, 3).map((src, idx) => (
          <div
            key={idx}
            className="relative w-6 h-6 rounded-full border border-border-strong overflow-hidden bg-white/95 ring-2 ring-background"
          >
            <Image src={src} alt="" aria-hidden fill sizes="24px" className="object-cover p-0.5" />
          </div>
        ))}
        {overflow > 0 && (
          <span className="grid place-items-center w-6 h-6 rounded-full bg-surface-3 ring-2 ring-background text-[10px] font-semibold text-foreground">
            +{overflow}
          </span>
        )}
      </div>
    </div>
  )
}

export function TrendingStrategy() {
  const [strategy, setStrategy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchStrategies()
      .then((res) => {
        setStrategy([...res].sort((a: any, b: any) => (b.apy ?? 0) - (a.apy ?? 0))[0] ?? null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section aria-labelledby="trending-heading" className="space-y-4">
      {/* Left-aligned to match every other section heading. It was centred
          while the content under it was left-aligned, and the "HOT" pill used
          animate-pulse — an always-running animation carrying no state. */}
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-accent-light" aria-hidden />
        <h2
          id="trending-heading"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Highest APY right now
        </h2>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-card p-5" aria-busy="true">
          <span className="sr-only">Loading the top strategy</span>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="skeleton h-5 w-20 rounded-md" />
              <div className="skeleton h-6 w-3/5" />
              <div className="skeleton h-4 w-2/5" />
              <div className="skeleton h-6 w-48 rounded-full" />
            </div>
            <div className="sm:w-32 space-y-2">
              <div className="skeleton h-3 w-10" />
              <div className="skeleton h-10 w-24" />
            </div>
          </div>
        </div>
      )}

      {!loading && (error || !strategy) && (
        <div className="rounded-xl border border-dashed border-border bg-card/40 px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {error
              ? "We couldn't load the trending strategy."
              : "No strategies have been published yet."}
          </p>
        </div>
      )}

      {!loading && !error && strategy && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={`/strategy/${strategy.id}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`${strategy.title}, ${strategy.apy?.toFixed(2)}% APY`}
          >
            <Card interactive className="p-5 gap-0">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="min-w-0 flex-1 space-y-3">
                  {strategy.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {strategy.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-md border border-accent/30 bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-light"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent-light">
                      {strategy.title}
                    </h3>
                    {/* Name and handle were two adjacent <p> tags with identical
                        styling, so they read as one run-on string. */}
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/90">
                        {strategy.strategistName}
                      </span>
                      {strategy.strategistHandle ? ` · ${strategy.strategistHandle}` : null}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3">
                    <IconRow label="Assets" items={strategy.assets} />
                    <IconRow label="Agents" items={strategy.agents} />
                    <IconRow label="Chains" items={strategy.chains} />
                  </div>
                </div>

                {/* Was `hidden md:flex` — the APY, the single number this whole
                    panel exists to surface, disappeared entirely on mobile. */}
                <div className="flex shrink-0 items-center justify-between gap-4 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-5 sm:w-36">
                  <div className="sm:text-right sm:w-full">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      APY
                    </p>
                    <p
                      data-numeric
                      className="font-display text-3xl font-bold leading-none text-accent-light mt-1"
                    >
                      {strategy.apy?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}
    </section>
  )
}
