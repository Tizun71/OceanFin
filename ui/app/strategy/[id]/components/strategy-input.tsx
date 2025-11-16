"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Info } from "lucide-react"
import { simulateStrategy } from "@/services/strategy-service"
import type { StrategySimulate } from "@/types/strategy.type"
import { useLuno } from "@/app/contexts/luno-context"
import { ConnectButton } from "@luno-kit/ui"
import { displayToast } from "@/components/shared/toast-manager"
import { isEvmAccountBound, getTokenBalance } from "@/services/user-service"
import { useParams } from "next/navigation"

const ExecutionModal = dynamic(() => import("@/components/shared/execution-modal").then(m => m.ExecutionModal), { ssr: false })
const BindAccountModal = dynamic(() => import("@/components/shared/bind-account-modal").then(m => m.BindAccountModal), { ssr: false })

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
  const [loadingSimulate, setLoadingSimulate] = useState(false)
  const [simulateResult, setSimulateResult] = useState<StrategySimulate | null>(null)
  const [simulateError, setSimulateError] = useState<string | null>(null)

  const [checkingBind, setCheckingBind] = useState(false)
  const [isAccountBound, setIsAccountBound] = useState<boolean | null>(null)
  const [bindModalOpen, setBindModalOpen] = useState(false)

  const [balance, setBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const { isConnected, address } = useLuno()

  useEffect(() => {
    const check = async () => {
      if (!isConnected || !address) {
        setIsAccountBound(null)
        return
      }

      setCheckingBind(true)
      try {
        const res = await isEvmAccountBound(address)
        setIsAccountBound(!!res?.isBound)
      } catch {
        setIsAccountBound(false)
      } finally {
        setCheckingBind(false)
      }
    }

    check()
  }, [isConnected, address])

  const fetchBalance = async (silent = false) => {
    try {
      if (!silent) setLoadingBalance(true)
      if (!isConnected || !address || !isAccountBound) return null

      const bal = await getTokenBalance(address, "5")
      setBalance(bal || "0")
      return bal ? Number(bal) : 0
    } catch (e) {
      console.error("fetch balance failed:", e)
      return null
    } finally {
      if (!silent) setLoadingBalance(false)
    }
  }

  useEffect(() => {
    if (!isConnected || !address || isAccountBound !== true) return

    fetchBalance()
    const interval = setInterval(() => fetchBalance(true), 600000)
    return () => clearInterval(interval)
  }, [isConnected, address, isAccountBound])

  const params = useParams<{ id: string | string[] }>()
  const strategyId = useMemo(() => {
    const raw = Array.isArray(params?.id) ? params.id[0] : (params?.id || "")
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }, [params])

  const asset = {
    symbol: "DOT",
    icon: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/5/icon.svg",
  }

  const handleSimulate = async () => {
    if (!amount || Number(amount) < 0.01) {
      return displayToast("error", "Please enter a amount greater than or equal to 0.01.")
    }
    if (!isConnected) return displayToast("error", "Please connect your wallet.")
    if (isAccountBound === false) return displayToast("error", "Bind EVM account first.")

    setLoadingSimulate(true)
    setSimulateResult(null)
    setSimulateError(null)

    try {
      const data = await simulateStrategy(strategy, Number(amount))
      setSimulateResult(data)
      onSimulateSuccess?.(data)
      displayToast("success", "Simulation completed successfully.")
    } catch (error: any) {
      const msg = error?.message || "Simulation failed"
      setSimulateError(msg)
      displayToast("error", msg)
    } finally {
      setLoadingSimulate(false)
    }
  }

  const handleExecute = async () => {
    if (!isConnected) return displayToast("error", "Please connect wallet.")
    if (isAccountBound === false) return setBindModalOpen(true)
    if (!simulateResult) return displayToast("warning", "Simulate strategy first.")

    const freshBalance = await fetchBalance()
    const inputAmount = Number(amount)

    if (freshBalance === null) {
      return displayToast("error", "Unable to fetch balance.")
    }

    if (freshBalance < inputAmount) {
      return displayToast(
        "error",
        `Insufficient balance. Required ${inputAmount}, but you only have ${freshBalance}.`
      )
    }

    setExecutionModalOpen(true)
  }

  const handleBindButton = () => {
    if (!isConnected) {
      displayToast("error", "Connect wallet first.")
      return
    }
    setBindModalOpen(true)
  }

  const onBindSuccess = () => {
    setIsAccountBound(true)
    setBindModalOpen(false)
    displayToast("success", "EVM account bound successfully.")
  }

  return (
    <>
      <div className="rounded-2xl p-8 border border-border bg-card backdrop-blur-xl shadow-lg">

        <h3 className="text-2xl font-extrabold text-primary mb-2">Strategy Input</h3>
        <p className="text-sm text-muted-foreground mb-6">Enter the amount you want to simulate</p>

        <div className="space-y-4 mb-5">

          <div className="flex items-center justify-end">
            <p className="text-sm text-muted-foreground">
              Est. Slippage: <span className="font-semibold text-foreground">1%</span>
            </p>
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

          {/* BALANCE */}
          {isConnected && (
            <div className="w-full flex justify-end">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>Balance:</span>

                {loadingBalance ? (
                  <div className="relative h-4 w-20 rounded-md overflow-hidden bg-accent/20">
                    <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                  </div>
                ) : (
                  <span className="font-semibold text-primary">{balance ?? "--"}</span>
                )}
                
              </div>
            </div>
          )}

        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/30 mb-5">
          <Info className="w-3 h-3 text-accent" />
          <p className="text-xs text-card-foreground leading-relaxed">
            Market conditions and price impact may affect the final execution.
          </p>
        </div>

        {/* BUTTONS */}
        <div className="space-y-3">
          {isConnected ? (
            <>
              <Button
                className="w-full h-10 bg-card hover:bg-card/80 hover:scale-[1.02] active:scale-[0.98] border-2 border-accent/30 hover:border-accent/50 text-accent font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!amount || Number(amount) <= 0 || loadingSimulate || checkingBind || isAccountBound === false}
                onClick={handleSimulate}
              >
                {checkingBind
                  ? "Checking binding..."
                  : loadingSimulate
                    ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                        <span className="animate-pulse">Simulating...</span>
                      </span>
                    )
                    : "Simulate Strategy"}
              </Button>

              {isAccountBound === false ? (
                <Button
                  className="w-full h-10 bg-gradient-to-r from-destructive via-destructive to-destructive/80 hover:shadow-[0_8px_24px_rgba(220,38,38,0.35)] hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-xl transition-all duration-200 shadow-md disabled:opacity-50"
                  onClick={handleBindButton}
                  disabled={checkingBind}
                >
                  Bind Account
                </Button>
              ) : (
                <Button
                  className="w-full h-10 bg-gradient-to-r from-accent via-accent to-accent-light hover:shadow-[0_8px_24px_rgba(0,209,255,0.35)] hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-xl transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
                  disabled={!amount || Number(amount) <= 0 || loadingSimulate || !simulateResult}
                  onClick={handleExecute}
                >
                  Execute Strategy
                </Button>
              )}
            </>
          ) : (
            <ConnectButton
              label="Connect Wallet"
              accountStatus="full"
              chainStatus="full"
              showBalance={true}
              className="w-full h-10 bg-gradient-to-r from-accent via-accent to-accent-light hover:shadow-[0_8px_24px_rgba(0,209,255,0.3)] text-white font-bold rounded-xl transition-all duration-300"
            />
          )}
        </div>
      </div>

      {/* EXECUTION MODAL */}
      {simulateResult && isAccountBound && (
        <ExecutionModal
          open={executionModalOpen}
          onOpenChange={setExecutionModalOpen}
          strategy={simulateResult}
          strategyId={strategyId}
          startFromStep={0}
          onStatusChange={(status) => {
            if (status === "completed") displayToast("success", "Strategy executed successfully.")
            if (status === "cancelled") displayToast("info", "Strategy execution cancelled.")
          }}
        />
      )}

      {/* BIND MODAL */}
      <BindAccountModal open={bindModalOpen} onOpenChange={setBindModalOpen} onBindSuccess={onBindSuccess} />
    </>
  )
}
