"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Info } from "lucide-react"
import { simulateStrategy } from "@/services/strategy-service"
import type { StrategySimulate } from "@/types/strategy.type"
import { useLuno } from "@/app/contexts/luno-context"
import { ConnectButton } from "@luno-kit/ui"

const ExecutionModal = dynamic(() => import("@/components/shared/execution-modal").then((m) => m.ExecutionModal), {
  ssr: false,
})

interface StrategyInputProps {
  strategy: {
    id: string
    inputAsset?: string | null
    inputAssetId?: string | number
    networkCost?: string | null
    slippage?: string | null
    title: string
    steps?: any[]
    iterations?: number
    assetIdIn?: string | number
  }
  onSimulateSuccess?: (data: any) => void
}

export function StrategyInput({ strategy, onSimulateSuccess }: StrategyInputProps) {
  const [amount, setAmount] = useState("")
  const [executionModalOpen, setExecutionModalOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [loadingSimulate, setLoadingSimulate] = useState(false)
  const [simulateResult, setSimulateResult] = useState<StrategySimulate | null>(null)
  const [simulateError, setSimulateError] = useState<string | null>(null)

  const { isConnected } = useLuno()

  const inputAsset = strategy.inputAsset || "-"
  const networkCost = strategy.networkCost || "-"
  const slippage = strategy.slippage || "-"

  const asset = {
    symbol: "DOT",
    icon: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/5/icon.svg",
  }

  const handleSimulate = async () => {
    if (!amount || Number(amount) <= 0 || !isConnected) return

    setLoadingSimulate(true)
    setSimulateResult(null)
    setSimulateError(null)

    try {
      const data = await simulateStrategy(strategy, Number(amount))
      setSimulateResult(data)
      onSimulateSuccess?.(data)
    } catch (error: any) {
      console.error("Simulation error:", error)
      setSimulateError(error?.message || "Simulation failed")
    } finally {
      setLoadingSimulate(false)
    }
  }

  const handleExecute = () => {
    if (!isConnected || !simulateResult) return
    setExecutionModalOpen(true)
  }

  return (
    <>
      <div className="rounded-2xl p-8 border border-border bg-card backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-xl hover:border-accent/50">
        {/* Header */}
        <div className="mb-7">
          <h3 className="text-2xl font-extrabold text-primary mb-2">
            Strategy Input
          </h3>
          <p className="text-sm font-normal text-muted-foreground">Enter the amount you want to simulate</p>
        </div>

        {/* Amount Input Section */}
        <div className="space-y-4 mb-5">
          {/* Slippage Info with Tooltip */}
          <div className="flex items-center justify-end gap-1.5 group">
            <p className="text-sm text-muted-foreground">
              Est. Slippage: <span className="font-semibold text-foreground">1%</span>
            </p>
            <div className="relative">
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              <div className="absolute right-0 top-6 w-48 p-2 bg-foreground text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-10">
                Maximum price deviation allowed during execution
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InputGroup className="flex-1 h-10 bg-input hover:bg-input/80 border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-300 shadow-sm">
              <InputGroupInput
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-base font-bold text-primary placeholder:text-muted-foreground border-0 focus-visible:ring-0 text-right px-3 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </InputGroup>

            {/* Asset Display Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 h-10 rounded-lg border-2 border-accent/30 bg-accent/10 hover:border-accent/50 hover:bg-accent/15 transition-all duration-300 shadow-sm">
              <div className="relative w-4 h-4">
                <Image
                  src={asset.icon || "/placeholder.svg"}
                  alt={asset.symbol}
                  width={16}
                  height={16}
                  className="rounded-full object-cover"
                />
              </div>
              <span className="font-bold text-accent text-sm tracking-wide">{asset.symbol}</span>
            </div>
          </div>


        </div>

        {/* Info Text */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/30 mb-5">
          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
            <Info className="w-3 h-3 text-accent" />
          </div>
          <p className="text-xs text-card-foreground leading-relaxed">
            Market conditions and price impact may affect the final execution.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isConnected ? (
            <>
              <Button
                className="w-full h-12 bg-card hover:bg-card/80 hover:scale-[1.02] active:scale-[0.98] border-2 border-accent/30 hover:border-accent/50 text-accent font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!amount || Number(amount) <= 0 || loadingSimulate}
                onClick={handleSimulate}
              >
                {loadingSimulate ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                    <span className="animate-pulse">Simulating...</span>
                  </span>
                ) : (
                  "Simulate Strategy"
                )}
              </Button>

              <Button
                className="w-full h-12 bg-gradient-to-r from-accent via-accent to-accent-light hover:shadow-[0_8px_24px_rgba(0,209,255,0.35)] hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
                disabled={!amount || Number(amount) <= 0 || loadingSimulate || !simulateResult}
                onClick={handleExecute}
              >
                Execute Strategy
              </Button>
            </>
          ) : (
            <ConnectButton
              label="Connect Wallet"
              accountStatus="full"
              chainStatus="full"
              showBalance={true}
              className="w-full h-12 bg-gradient-to-r from-accent via-accent to-accent-light hover:shadow-[0_8px_24px_rgba(0,209,255,0.3)] text-white font-bold rounded-xl transition-all duration-300"
            />
          )}
        </div>

        {/* Simulate Error */}
        {simulateError && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {simulateError}
          </div>
        )}
      </div>

      {simulateResult && (
        <ExecutionModal open={executionModalOpen} onOpenChange={setExecutionModalOpen} strategy={simulateResult} />
      )}
    </>
  )
}
