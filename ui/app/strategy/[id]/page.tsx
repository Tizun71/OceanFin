"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { StrategyHeader } from "./components/strategy-header"
import { StrategyInput } from "./components/strategy-input"
import { StrategyTabs } from "./components/strategy-tabs"
import { SimulateResult } from "@/app/types/simulate"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function StrategyPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<SimulateResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${BASE_URL}/simulate/${params.id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const result: SimulateResult = await res.json()
        console.log("✅ BE response:", result)

        if (!result) {
          setError("No strategy data found")
        } else {
          setData(result)
        }
      } catch (err: any) {
        console.error("❌ Fetch error:", err)
        setError(err.message || "Failed to fetch strategy")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) return <div className="text-center py-10">Loading strategy flow...</div>
  if (error) return <div className="text-red-500 text-center py-10">Error: {error}</div>
  if (!data) return <div className="text-gray-400 text-center py-10">No strategy found</div>

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 web3-grid">
        <HeroSection />
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <StrategyInput strategy={data} />
            </div>
            <div className="lg:col-span-2">
              <StrategyHeader strategy={data} />
              <StrategyTabs strategy={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
