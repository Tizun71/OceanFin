"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, ChevronDown } from "lucide-react";
import { WalletConnectModal } from "@/components/shared/wallet-connect-modal";
import { ExecutionModal } from "@/components/shared/execution-modal";

interface StrategyInputProps {
  strategy: {
    id: string;
    inputAsset?: string | null;
    networkCost?: string | null;
    slippage?: string | null;
    title: string;
    steps?: any[];
  };
  onSimulateSuccess?: (data: any) => void; 
}

export function StrategyInput({ strategy, onSimulateSuccess }: StrategyInputProps) {
  const [amount, setAmount] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingSimulate, setLoadingSimulate] = useState(false);
  const [simulateResult, setSimulateResult] = useState<any>(null);

  const inputAsset = strategy.inputAsset || "-";
  const networkCost = strategy.networkCost || "-";
  const slippage = strategy.slippage || "-";

  const handleConnect = () => {
    setWalletModalOpen(true);
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  };

  const handleExecute = () => {
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }
    setExecutionModalOpen(true);
  };

  // Simulate API
  const handleSimulate = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return;

    setLoadingSimulate(true);
    setSimulateResult(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/strategies/${strategy.id}/simulate?amount=${amount}`,
        { method: "GET" }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Simulation failed: ${text}`);
      }

      const data = await res.json();
      setSimulateResult(data);
      onSimulateSuccess?.(data); 
    } catch (error: any) {
      console.error(" Simulation error:", error);
      setSimulateResult({ error: error.message || "Simulation failed" });
    } finally {
      setLoadingSimulate(false);
    }
  };

  return (
    <>
      <div className="glass rounded-lg p-6 sticky top-24">
        {/* === HEADER === */}
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
          Input
        </h3>

        {/* === AMOUNT INPUT === */}
        <div className="p-4 rounded-lg bg-background/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Amount</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {inputAsset[0]}
                </span>
              </div>
              <span className="font-semibold">{inputAsset}</span>
            </div>
          </div>

          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-[#00D1FF]"
          />
        </div>

        {/* === INFO TEXT === */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mt-4">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Funds will be swapped into {inputAsset} via a DEX. Price impact may
            occur during swaps.
          </p>
        </div>

        {/* === DETAILS SECTION === */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => setDetailsOpen(!detailsOpen)}
          >
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors">
              <span className="text-sm">Details</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  detailsOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {detailsOpen && (
            <div className="space-y-2 text-sm p-3 rounded-lg bg-background/50">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Est. Network Cost</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary/20" />
                  <span className="text-[#00D1FF] font-semibold">
                    {networkCost}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="text-[#00D1FF] font-semibold">
                  {slippage}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* === SIMULATION RESULT === */}
        {simulateResult && (
          <div className="mt-4 p-3 bg-background/50 rounded-lg text-sm border border-border text-primary animate-in fade-in slide-in-from-top-2 duration-200">
            {simulateResult.error ? (
              <span className="text-red-500">
                {simulateResult.error}
              </span>
            ) : (
              <>
                <p>
                  <span className="text-muted-foreground">Estimated Output:</span>{" "}
                  <span className="text-[#00D1FF] font-semibold">
                    {simulateResult.estimatedOutput || "-"}
                  </span>
                </p>
                {simulateResult.steps && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {simulateResult.steps.length} steps in this strategy.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* === ACTION BUTTONS === */}
        <div className="mt-4 space-y-3">
          {isConnected ? (
            <>
              <Button
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={!amount || Number.parseFloat(amount) <= 0 || loadingSimulate}
                onClick={handleSimulate}
              >
                {loadingSimulate ? "Simulating..." : "Simulate"}
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] hover:opacity-90 glow-cyan text-black font-semibold"
                disabled={!amount || Number.parseFloat(amount) <= 0}
                onClick={handleExecute}
              >
                Execute Strategy
              </Button>
            </>
          ) : (
            <>
              <Button className="w-full bg-muted text-muted-foreground cursor-not-allowed" disabled>
                Simulate
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] hover:opacity-90 glow-cyan text-black font-semibold"
                onClick={handleConnect}
              >
                Connect Wallet
              </Button>
            </>
          )}
        </div>
      </div>

      {/* === MODALS === */}
      <WalletConnectModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
      />
      <ExecutionModal
        open={executionModalOpen}
        onOpenChange={setExecutionModalOpen}
        strategy={strategy}
      />
    </>
  );
}
