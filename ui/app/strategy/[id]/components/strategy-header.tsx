"use client"

import { Share2, Check, ShieldCheck } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface StrategyHeaderProps {
  strategy: {
    title: string
    status?: "Active" | "Inactive"
    apy: number
    strategistName?: string
    strategistHandle?: string
    date?: string
  }
}

export function StrategyHeader({ strategy }: StrategyHeaderProps) {
  const [copied, setCopied] = useState(false)
  const isActive = strategy.status !== "Inactive"

  const handleShare = async () => {
    // The share button was previously a dead control — an icon with no
    // onClick and no accessible name.
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard blocked (insecure origin or denied permission) — the button
         simply stays in its resting state rather than throwing. */
    }
  }

  return (
    <header className="glass rounded-xl p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            {/* Was `text-[#0f1419]` — near-black type on the dark navy
                background, contrast about 1.2:1. The page title was
                effectively invisible. */}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {strategy.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                isActive
                  ? "border-success/30 bg-success/15 text-success"
                  : "border-border bg-surface-2 text-muted-foreground"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              Strategy by
              <span className="inline-flex items-center gap-1.5 text-foreground/90 font-medium">
                <Image
                  src="/logo-ocean-fin.svg"
                  alt=""
                  aria-hidden
                  width={18}
                  height={18}
                  className="rounded-full"
                />
                {strategy.strategistName || strategy.strategistHandle || "Unknown"}
              </span>
            </span>
            {strategy.date && (
              <>
                <span aria-hidden className="text-border-strong">
                  ·
                </span>
                <span>{strategy.date}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              APY
            </p>
            {/* Was a hardcoded `#10b981` — an emerald green that belongs to no
                part of the ocean palette and clashed with the teal accent. */}
            <p
              data-numeric
              className="font-display text-3xl md:text-4xl font-bold leading-none text-accent-light mt-1"
            >
              {strategy.apy?.toFixed(2)}%
            </p>
          </div>

          <button
            type="button"
            onClick={handleShare}
            aria-label={copied ? "Link copied" : "Copy link to this strategy"}
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" aria-hidden />
            ) : (
              <Share2 className="w-4 h-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* The custody notice was sitting inline next to the APY at the same
          muted size as the metadata, so a legally meaningful statement read
          as an afterthought glued to the headline number. */}
      <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="w-4 h-4 shrink-0 text-accent mt-px" aria-hidden />
        <span>
          OceanFin never takes custody of your assets. Funds stay under your control
          at all times.
        </span>
      </p>
    </header>
  )
}
