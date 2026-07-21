"use client"

import { useEffect } from "react"
import { StrategyList } from "./strategy/[id]/components/strategy-list"
import { HomeHero } from "@/components/home/home-hero"
import { StrategyPaths } from "@/components/home/strategy-paths"
import { TrendingStrategy } from "@/components/home/trending-strategy"
import { Preloader } from "@/components/preloader"
import { usePreloader } from "@/providers/preloader-provider"

export default function Home() {
  const preloader = usePreloader()

  useEffect(() => {
    // Plays only on the first app entry per session; sessionStorage-gated.
    preloader.showOnce()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Preloader />

      <div className="w-full mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Hero spans the full content width. It used to be the top of the left
            grid cell, so the page heading was capped at half the viewport and
            sat level with the search input in the neighbouring column. */}
        <div className="pt-8 pb-14 md:pt-14 md:pb-20">
          <HomeHero />
        </div>

        {/* Asymmetric split. The old grid was `1fr 1fr`, giving equal weight to
            supporting content and to the strategy list that is the actual
            product. The list now leads and the rest becomes a sidebar.
            `items-start` stops the short column from stretching to match. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8 xl:gap-12 items-start pb-20">
          <section aria-labelledby="all-heading" className="min-w-0 order-2 lg:order-1">
            <h2
              id="all-heading"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4"
            >
              All strategies
            </h2>
            <StrategyList />
          </section>

          {/* On mobile this sits above the list: the single trending strategy
              is a faster read than a filterable list, so it earns the first
              screen. On desktop it becomes a sticky rail that stays in view
              while the list scrolls. */}
          <aside className="min-w-0 order-1 lg:order-2 space-y-10 lg:sticky lg:top-28">
            <TrendingStrategy />
            <StrategyPaths />
          </aside>
        </div>
      </div>
    </>
  )
}
