"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, ChevronDown } from "lucide-react";
import { simulateStrategy } from "@/services/strategy-service";
import type { StrategySimulate } from "@/types/strategy.type";
import { useLuno } from "@/app/contexts/luno-context";
import { ConnectButton } from "@luno-kit/ui";

const ExecutionModal = dynamic(
  () =>
    import("@/components/shared/execution-modal").then(
      (m) => m.ExecutionModal
    ),
  { ssr: false }
);

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
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loadingSimulate, setLoadingSimulate] = useState(false);
  const [simulateResult, setSimulateResult] = useState<StrategySimulate | null>(null);
  const [simulateError, setSimulateError] = useState<string | null>(null);

  const { isConnected } = useLuno();

  const inputAsset = strategy.inputAsset || "-";
  const networkCost = strategy.networkCost || "-";
  const slippage = strategy.slippage || "-";

  const handleSimulate = async () => {
    if (!amount || Number(amount) <= 0 || !isConnected) return;

    setLoadingSimulate(true);
    setSimulateResult(null);
    setSimulateError(null);

    try {
      const data = await simulateStrategy(strategy, Number(amount));
      setSimulateResult(data);
      onSimulateSuccess?.(data);
    } catch (error: any) {
      console.error("Simulation error:", error);
      setSimulateError(error?.message || "Simulation failed");
    } finally {
      setLoadingSimulate(false);
    }
  };

  const handleExecute = () => {
    if (!isConnected || !simulateResult) return;
    setExecutionModalOpen(true);
  };

  return (
    <>
      <div className="rounded-2xl p-6 border border-white/20 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.15)]">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
          Input
        </h3>

        {/* Amount Input */}
        <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-inner transition-all duration-300 hover:bg-white/90">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 mb-2">Amount</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-white">{inputAsset[0]}</span>
              </div>
            </div>
          </div>

          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-[#00A2FF] placeholder-gray-400 transition-all duration-300"
          />
        </div>

        {/* Info Text */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-100/70 mt-4 border border-gray-200 hover:bg-gray-100 transition-all duration-300">
          <Info className="w-4 h-4 text-[#00A2FF] mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            Funds will be swapped into <span className="text-[#00A2FF]">{inputAsset}</span> via a DEX. Price impact may occur during swaps.
          </p>
        </div>

        {/* Simulation Result */}
        {(simulateResult || simulateError) && (
          <div className="mt-4 p-3 bg-white/70 border border-gray-200 rounded-xl text-sm shadow-sm text-[#00A2FF] animate-in fade-in slide-in-from-top-2 duration-200">
            {simulateError ? (
              <span className="text-red-500">{simulateError}</span>
            ) : (
              <>
                <p>
                  <span className="text-gray-500">Input Amount:</span>{" "}
                  <span className="text-[#00A2FF] font-semibold">
                    {simulateResult?.initialCapital?.amount} {simulateResult?.initialCapital?.symbol}
                  </span>
                </p>

                <p className="text-gray-500 mt-2">Strategy Steps:</p>
                <ul className="ml-4 list-disc text-xs text-gray-600">
                  {simulateResult?.steps?.map((step: any) => (
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
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all duration-300"
                disabled={!amount || Number(amount) <= 0 || loadingSimulate}
                onClick={handleSimulate}
              >
                {loadingSimulate ? "Simulating..." : "Simulate"}
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] hover:opacity-90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
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
              className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] hover:opacity-90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            />
          )}
        </div>
      </div>

      {simulateResult && ( 
        <ExecutionModal 
         open={executionModalOpen}
         onOpenChange={setExecutionModalOpen} 
         strategy={simulateResult} 
         />
      )}
    </>
  );
}
