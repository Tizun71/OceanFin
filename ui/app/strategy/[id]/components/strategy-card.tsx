"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, CircleOff } from "lucide-react";

interface Strategy {
  id: string;
  title: string;
  tags: string[];
  apy: number;
  strategist: string;
  strategistName: string;
  strategistHandle: string;
  handle: string;
  date: string;
  assets: string[];
  agents: string[];
  chains: string[];
  status: "Active" | "Inactive";
}

interface StrategyCardProps {
  strategy: Strategy;
}

const safeGet = (obj: Record<string, string>, key: string) =>
  obj[key] ||
  obj[key.toUpperCase()] ||
  obj[key.toLowerCase()] ||
  "/icons/default.png";

/** Icon row for assets / agents / chains. Extracted because the three groups
 *  were identical markup repeated with only the tint token changed. */
function IconGroup({
  label,
  items,
  tint,
  max = 2,
}: {
  label: string
  items: string[]
  tint: string
  max?: number
}) {
  if (!items?.length) return null
  const overflow = items.length - max

  return (
    <div className="flex items-center gap-2 min-w-0">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="flex -space-x-1.5">
        {items.slice(0, max).map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className={`relative w-7 h-7 rounded-full border ${tint} overflow-hidden bg-white/95 ring-2 ring-background`}
          >
            <Image src={src} alt="" aria-hidden fill className="object-cover p-0.5" sizes="28px" />
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-7 h-7 rounded-full bg-surface-3 text-foreground border border-border-strong ring-2 ring-background flex items-center justify-center text-[10px] font-semibold">
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const isActive = strategy.status !== "Inactive"

  return (
    // The whole card is the link. Previously only the small "Try Now" button
    // navigated, so the card hover-lifted while declaring `cursor-default` and
    // was unreachable by keyboard except through that one button.
    <Link
      href={`/strategy/${strategy.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${strategy.title} by ${strategy.strategistName}, ${strategy.apy.toFixed(2)}% APY`}
    >
      <Card interactive className="p-4 gap-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Stacks on mobile; the old grid-cols-4 held 4 columns at every width. */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex gap-1.5 flex-wrap">
                {strategy.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-accent/15 text-accent-light text-xs font-semibold border border-accent/30 rounded-md px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div
                className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 border ${
                  isActive
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-destructive/10 text-destructive border-destructive/30"
                }`}
              >
                {isActive ? (
                  <CheckCircle2 className="w-3 h-3" aria-hidden />
                ) : (
                  <CircleOff className="w-3 h-3" aria-hidden />
                )}
                {isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="mb-4">
              {/* font-black at 18px on a display face is heavier than the page
                  ever needs; semibold keeps the title dominant without shouting. */}
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent-light transition-colors leading-snug mb-1 tracking-tight">
                {strategy.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground/90">{strategy.strategistName}</span>
                {strategy.strategistHandle ? ` · ${strategy.strategistHandle}` : null}
              </p>
            </div>

            <div className="flex items-center gap-x-5 gap-y-2 flex-wrap pt-3 border-t border-border">
              <IconGroup label="Asset" items={strategy.assets} tint="border-accent/30" />
              <IconGroup label="Agent" items={strategy.agents} tint="border-secondary/40" />
              <IconGroup label="Chain" items={strategy.chains} tint="border-tertiary/40" />
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between text-right flex-shrink-0 sm:min-w-[128px] sm:border-l border-border sm:pl-4 gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                APY
              </p>
              {/* Gradient clip-text was rendering the single most important
                  number at roughly 3:1 against the card. Solid accent reads
                  cleanly and stays legible if the gradient fails to paint. */}
              <p
                data-numeric
                className="font-display text-3xl md:text-4xl font-bold text-accent-light whitespace-nowrap leading-none"
              >
                {strategy.apy.toFixed(2)}%
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light whitespace-nowrap">
              Try now
              <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
