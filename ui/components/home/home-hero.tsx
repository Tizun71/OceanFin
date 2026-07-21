"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * Full-bleed hero band.
 *
 * Previously this lived inside FeaturedStrategies, which was itself the left
 * cell of a two-column grid — so the page's <h1> and tagline were confined to
 * half the viewport while a search bar sat level with them on the right. A
 * hero introduces the whole page, so it now spans the full content width and
 * sits above the split.
 */
export function HomeHero() {
  return (
    <section className="relative">
      {/* Left-aligned rather than centred: it shares an edge with the content
          grid below, so the eye gets one consistent left margin down the page
          instead of a centred block over left-aligned lists. */}
      <div className="max-w-2xl">
        {/* Real text, not a canvas. The wordmark used to be rendered by
            ParticleTextEffect, which meant the page had no readable <h1> for
            search engines or screen readers and shipped a particle simulation
            to draw two words. */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
        >
          Maximize your DeFi growth
          <span className="block text-accent-light">with smart strategies.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          // ~65 characters keeps the line length in the comfortable reading band.
          className="mt-5 text-base md:text-lg text-muted-foreground max-w-[52ch] leading-relaxed"
        >
          Browse strategies built by the community, simulate the outcome before
          you commit, and run them in a single click.
        </motion.p>

        {/* The hero had no call to action at all — it introduced the product
            and then handed the user nothing to do. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/builder"
            className="group inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Build a strategy
            <ArrowRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href="/prompt"
            className="inline-flex h-11 items-center rounded-lg border border-border-strong px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Describe your strategy
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
