"use client"

import { StrategyList } from "./strategy/[id]/components/strategy-list"
import { FeaturedStrategies } from "./strategy/[id]/components/strategy-featured"
import { useEffect, useState } from "react"
import { Preloader } from "@/components/preloader"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return (
    <>
      <Preloader />

      <div className="flex h-auto min-h-[calc(100vh-110px)] mt-15 overflow-hidden">
        <main className="flex-1 relative mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6 h-[calc(100vh-140px)]">
            <div className="w-full pr-2">
              <FeaturedStrategies />
            </div>

            <div className="w-full pr-2">
              <StrategyList />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
