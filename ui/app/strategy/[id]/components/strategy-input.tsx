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
    inputAssetId?: string | number; 
    networkCost?: string | null;
    slippage?: string | null;
    title: string;
    steps?: any[];
    iterations?: number; 
    assetIdIn?: string | number;
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
    setTimeout(() => setIsConnected(true), 1000);
  };

  const handleExecute = () => {
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }
    setExecutionModalOpen(true);
  };

  const handleSimulate = async () => {
    if (!amount || Number(amount) <= 0) return;

    setLoadingSimulate(true);
    setSimulateResult(null);

    try {
     
      const assetIn = strategy.inputAssetId || 2;
      const iterations = strategy.iterations || 3;
      const assetIdIn = strategy.assetIdIn || 5;

      const url = `${process.env.NEXT_PUBLIC_API_URL}/strategies/${strategy.id}/simulate?amountIn=${amount}&assetIn=${assetIn}&iterations=${iterations}&assetIdIn=${assetIdIn}`;

      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Simulation failed: ${text}`);
      }

      const data = await res.json();
      setSimulateResult(data);
      onSimulateSuccess?.(data);
    } catch (error: any) {
      console.error("Simulation error:", error);
      setSimulateResult({ error: error.message || "Simulation failed" });
    } finally {
      setLoadingSimulate(false);
    }
  };

  return (
    <>
      <div className="glass rounded-lg p-6 sticky top-24">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
          Input
        </h3>

        {/* Amount Input */}
        <div className="p-4 rounded-lg bg-background/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Amount</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{inputAsset[0]}</span>
              </div>
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

        {/* Info Text */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mt-4">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Funds will be swapped into {inputAsset} via a DEX. Price impact may occur during swaps.
          </p>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => setDetailsOpen(!detailsOpen)}
          >
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors">
              <span className="text-sm">Details</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {detailsOpen && (
            <div className="space-y-2 text-sm p-3 rounded-lg bg-background/50">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Est. Network Cost</span>
                <span className="text-[#00D1FF] font-semibold">{networkCost}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="text-[#00D1FF] font-semibold">{slippage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Simulation Result */}
        {simulateResult && (
          <div className="mt-4 p-3 bg-background/50 rounded-lg text-sm border border-border text-primary animate-in fade-in slide-in-from-top-2 duration-200">
            {simulateResult.error ? (
              <span className="text-red-500">{simulateResult.error}</span>
            ) : (
              <>
                <p>
                  <span className="text-muted-foreground">Input Amount:</span>{" "}
                  <span className="text-[#00D1FF] font-semibold">
                    {simulateResult.initialCapital?.amount} {simulateResult.initialCapital?.symbol}
                  </span>
                </p>

                <p className="text-muted-foreground mt-2">Strategy Steps:</p>
                <ul className="ml-4 list-disc text-xs text-muted-foreground">
                  {simulateResult.steps?.map((step: any) => (
                    <li key={step.step}>
                      Step {step.step} - {step.type}{" "}
                      {step.tokenOut ? `: ${step.tokenOut.amount} ${step.tokenOut.symbol}` : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 space-y-3">
          {isConnected ? (
            <>
              <Button
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={!amount || Number(amount) <= 0 || loadingSimulate}
                onClick={handleSimulate}
              >
                {loadingSimulate ? "Simulating..." : "Simulate"}
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] hover:opacity-90 glow-cyan text-black font-semibold"
                disabled={!amount || Number(amount) <= 0}
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

      {/* Modals */}
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
      <ExecutionModal open={executionModalOpen} onOpenChange={setExecutionModalOpen} strategy={strategy} />
    </>
  );
}
