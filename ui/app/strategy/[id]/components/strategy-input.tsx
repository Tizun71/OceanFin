"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Info } from "lucide-react"
import { simulateStrategy } from "@/services/strategy-service"
import type { StrategySimulate } from "@/types/strategy.type"
import { useWallet } from "@/hooks/use-wallet"
import { EvmConnectButton } from "@/components/shared/evm-connect-button"
import { displayToast } from "@/components/shared/toast-manager"
import { isEvmAccountBound, getTokenBalance } from "@/services/user-service"
import { useParams } from "next/navigation"
import { useStrategyInputToken } from "@/hooks/use-strategy-input-token"
import { useActiveChain } from "@/hooks/use-active-chain"
import { usePublicClient } from "wagmi"
import { formatUnits } from "viem"
import { ERC20_ABI } from "@/lib/evm/abis"

const ExecutionModal = dynamic(() => import("@/components/shared/execution-modal").then(m => m.ExecutionModal), { ssr: false })
const BindAccountModal = dynamic(() => import("@/components/shared/bind-account-modal").then(m => m.BindAccountModal), { ssr: false })

interface StrategyInputProps {
  strategy: {
    id: string
    /** Entry token symbols from the strategies API; assets[0] is the input token. */
    assets?: string[]
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

  const { isConnected, address, needsSwitch, switchToActive } = useWallet()
  const [switching, setSwitching] = useState(false)

  // The input token comes from the strategy itself — never hardcode one here.
  // On EVM it resolves to an ERC-20 address + decimals via the token registry.
  const { activeChain, isEvm } = useActiveChain()
  const asset = useStrategyInputToken(strategy)
  const publicClient = usePublicClient({ chainId: activeChain.chainId })

  useEffect(() => {
    const check = async () => {
      // Account binding only exists on Hydration (linking an EVM address to a
      // substrate account). EVM chains sign directly — nothing to bind.
      if (isEvm || !isConnected || !address) {
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
  }, [isConnected, address, isEvm])

  const fetchBalance = async (silent = false) => {
    try {
      if (!silent) setLoadingBalance(true)
      if (!isConnected || !address) return null

      // EVM: read the strategy's own input token on-chain.
      if (isEvm) {
        if (asset.decimals === undefined || !publicClient) {
          setBalance(null)
          return null
        }

        // A native coin (AVAX/ETH) has no contract — read the account balance.
        const raw = asset.isNative
          ? await publicClient.getBalance({ address: address as `0x${string}` })
          : asset.address
            ? ((await publicClient.readContract({
                address: asset.address,
                abi: ERC20_ABI,
                functionName: "balanceOf",
                args: [address as `0x${string}`],
              })) as bigint)
            : null

        if (raw === null) {
          setBalance(null)
          return null
        }

        const formatted = formatUnits(raw, asset.decimals)
        setBalance(formatted)
        return Number(formatted)
      }

      // Substrate: Hydration balance endpoint, keyed by the token's asset id.
      if (!isAccountBound) return null
      if (!asset.assetId) {
        setBalance(null)
        return null
      }

      const bal = await getTokenBalance(address, asset.assetId)
      setBalance(bal || "0")
      return bal ? Number(bal) : 0
    } catch (e) {
      displayToast("error", "Failed to fetch balance.")
      return null
    } finally {
      if (!silent) setLoadingBalance(false)
    }
  }

  useEffect(() => {
    if (!isConnected || !address) return
    // Account binding is a Hydration concept; EVM balances need no binding.
    if (!isEvm && isAccountBound !== true) return

    fetchBalance()
    const interval = setInterval(() => fetchBalance(true), 600000)
    return () => clearInterval(interval)
  }, [isConnected, address, isAccountBound, isEvm, asset.assetId, asset.address, asset.decimals, asset.isNative])

  const params = useParams<{ id: string | string[] }>()
  const strategyId = useMemo(() => {
    const raw = Array.isArray(params?.id) ? params.id[0] : (params?.id || "")
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }, [params])

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
      const data = await simulateStrategy(strategy, Number(amount), asset)
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

  const handleSwitchNetwork = async () => {
    setSwitching(true)
    try {
      await switchToActive()
    } catch {
      displayToast("error", `Switch your wallet to ${activeChain.name} to continue.`)
    } finally {
      setSwitching(false)
    }
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
      <div className="rounded-xl p-5 border border-border bg-card backdrop-blur-xl shadow-md">

        <h2 className="text-base font-semibold text-foreground mb-1">Simulate this strategy</h2>
        {/* Was `text-2xl font-extrabold` — a side panel heading competing with
            the page <h1> directly beside it. */}
        <p className="text-sm text-muted-foreground mb-5">
          Check the projected outcome before committing funds.
        </p>

        <div className="space-y-2 mb-4">
          {/* The amount field had no <label> at all — only a "0.00"
              placeholder, which disappears the moment you type. */}
          <div className="flex items-center justify-between">
            <label htmlFor="simulate-amount" className="text-sm font-medium text-foreground">
              Amount
            </label>
            {isConnected && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Balance:
                {loadingBalance ? (
                  <span className="skeleton inline-block h-3.5 w-16 align-middle" />
                ) : (
                  <span data-numeric className="font-medium text-foreground">
                    {balance ?? "--"}
                  </span>
                )}
                {/* Retyping the full balance by hand was the only way to go
                    all-in; every other DeFi UI offers this shortcut. */}
                {!loadingBalance && balance != null && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(balance))}
                    className="ml-0.5 rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-accent-light transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Max
                  </button>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <InputGroup className="flex-1 h-11 bg-input border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-ring/40 transition-colors">
              <InputGroupInput
                id="simulate-amount"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                // `font-bold text-primary` made a plain input look like a
                // highlighted value; tabular figures stop the number jittering
                // in width as digits change.
                className="text-base text-foreground tabular placeholder:text-muted-foreground-subtle border-0 focus-visible:ring-0 text-right px-3"
              />
            </InputGroup>

            <div className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
              <div className="relative w-5 h-5">
                {asset.icon ? (
                  <Image
                    src={asset.icon}
                    alt=""
                    aria-hidden
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                ) : (
                  // No icon mapped (e.g. an EVM token) — show a letter badge.
                  <div className="w-5 h-5 rounded-full bg-accent/25 flex items-center justify-center text-[10px] font-semibold text-accent-light">
                    {asset.symbol.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {asset.symbol || "—"}
              </span>
            </div>
          </div>

          <p className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Est. slippage</span>
            <span data-numeric className="font-medium text-foreground">1%</span>
          </p>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-1 border border-border mb-4">
          {/* Was `w-3 h-3` next to 12px text with `items-start`, so the icon
              sat visibly above the first line it belonged to. */}
          <Info className="w-4 h-4 shrink-0 text-accent mt-px" aria-hidden />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Market conditions and price impact may affect the final execution.
          </p>
        </div>

        {/* BUTTONS
            The hierarchy was inverted. "Simulate" — the only action available
            on arrival — was styled as a quiet outline, while "Execute" wore a
            loud accent gradient despite being disabled until a simulation had
            run. Users were drawn to the button they could not press.
            Simulate is now the primary; Execute becomes primary only once it
            is actually actionable. All three also used `text-white` on mid
            accent/amber fills, which fails AA. */}
        <div className="space-y-2.5">
          {isConnected ? (
            <>
              <Button
                size="lg"
                className="w-full"
                disabled={!amount || Number(amount) <= 0 || loadingSimulate || checkingBind || isAccountBound === false}
                onClick={handleSimulate}
              >
                {checkingBind
                  ? "Checking binding…"
                  : loadingSimulate
                    ? (
                      <>
                        <span
                          aria-hidden
                          className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"
                        />
                        Simulating…
                      </>
                    )
                    : "Simulate strategy"}
              </Button>

              {isEvm && needsSwitch ? (
                // Signing is impossible from another network: wagmi has no wallet
                // client for the active chain, so offer the switch up front
                // instead of failing mid-execution.
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full border-warning/40 bg-warning/15 text-warning hover:bg-warning/25"
                  onClick={handleSwitchNetwork}
                  disabled={switching}
                >
                  {switching ? "Switching…" : `Switch wallet to ${activeChain.name}`}
                </Button>
              ) : !isEvm && isAccountBound === false ? (
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25"
                  onClick={handleBindButton}
                  disabled={checkingBind}
                >
                  Bind account
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant={simulateResult ? "default" : "outline"}
                  className="w-full"
                  disabled={!amount || Number(amount) <= 0 || loadingSimulate || !simulateResult}
                  onClick={handleExecute}
                >
                  Execute strategy
                </Button>
              )}

              {/* A disabled button with no explanation reads as a broken UI. */}
              {!simulateResult && (
                <p className="text-xs text-muted-foreground text-center pt-0.5">
                  Run a simulation to enable execution.
                </p>
              )}
            </>
          ) : (
            <EvmConnectButton />
          )}
        </div>
      </div>

      {/* EXECUTION MODAL — EVM signs directly, so no binding is required there. */}
      {simulateResult && (isEvm || isAccountBound) && (
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

      {/* BIND MODAL — Hydration only; EVM has no account binding. */}
      {!isEvm && (
        <BindAccountModal open={bindModalOpen} onOpenChange={setBindModalOpen} onBindSuccess={onBindSuccess} />
      )}
    </>
  )
}
