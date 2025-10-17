"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StrategyFlow } from "./strategy-flow";
import { simulateStrategy } from "@/services/strategy-service";

interface TokenInfo {
  assetId?: string | number;
  symbol?: string;
  amount?: string | number | null;
}

interface Strategy {
  id: string;
  title: string;
  tags: string[];
  apy: number;
  strategist: string;
  strategistName: string;
  strategistHandl: string;
  handle: string;
  date: string;
  assets: string[];
  agents: string[];
  chains: string[];
  status: "Active" | "Inactive";
}

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [flowData, setFlowData] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.closest("button")) return;

    router.push(`/strategy/${strategy.id}`);
  };

  const handleRunSimulation = () => setIsModalOpen(true);

  const handleConfirm = async () => {
    setIsModalOpen(false);
    setIsSimulating(true);
    setProgress(0);

    try {
      const result = await simulateStrategy(strategy, Number(amount));

      let percent = 0;
      const timer = setInterval(() => {
        percent += 10;

        if (percent >= 100) {
          percent = 100;
          setProgress(percent);
          clearInterval(timer);

          setTimeout(() => {
            setIsSimulating(false);
            setFlowData(result);
            setShowFlowModal(true);
            setIsSimulated(true);
          }, 500);

          return;
        }

        setProgress(percent);
      }, 200);
    } catch (error: any) {
      console.error("Simulation failed:", error.message);
      setIsSimulating(false);
      alert("Simulation failed. Please try again.");
    }
  };

  // === View Details ===
  const handleViewDetail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    if (flowData) {
      setShowFlowModal(true);
    } else {
      alert("No simulation data available yet. Please run a simulation first.");
    }
  };

  return (
    <>
      {/* CARD */}
      <Card
        onClick={handleCardClick}
        className="group relative overflow-hidden p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary/60 glass border border-transparent cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Tags */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {strategy.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-primary/10 text-primary text-xs border border-primary/20"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-4 text-[#0f1419] group-hover:text-primary transition-all">
            {strategy.title}
          </h3>

          {/* Strategist + APY */}
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Strategist</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-xs text-white font-bold">P</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f1419]">
                    {strategy.strategistName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {strategy.strategistHandl}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">APY</p>
              <p className="text-2xl font-bold text-[#10b981]">
                {strategy.apy.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Assets / Agents / Chains */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/20 mb-12">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Asset</p>
              <div className="flex gap-1">
                {strategy.assets.slice(0, 2).map((asset) => (
                  <div
                    key={asset}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center"
                    title={asset}
                  >
                    <span className="text-[10px] font-bold text-primary">
                      {asset.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Agent</p>
              <div className="flex gap-1">
                {strategy.agents.slice(0, 2).map((agent) => (
                  <div
                    key={agent}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border border-secondary/30 flex items-center justify-center"
                    title={agent}
                  >
                    <span className="text-[10px] font-bold text-secondary">
                      {agent.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Chain</p>
              <div className="flex gap-1">
                {strategy.chains.slice(0, 2).map((chain) => (
                  <div
                    key={chain}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-accent/30 flex items-center justify-center"
                    title={chain}
                  >
                    <span className="text-[10px] font-bold text-accent">
                      {chain.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                isSimulated
                  ? alert("Executing strategy...")
                  : handleRunSimulation();
              }}
              className={`flex items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all duration-200 ${
                isSimulated
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-blue-400 hover:bg-blue-500 text-white"
              }`}
            >
              {isSimulated ? "🚀 Execute" : "✨ Run Simulation"}
            </button>

            <button
              onClick={handleViewDetail}
              className="flex items-center justify-center bg-white border border-gray-300 text-gray-800 font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200"
            >
              View Details
            </button>
          </div>
        </div>
      </Card>

      {/* Popup  token */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Enter Token Amount
            </h2>
            <input
              type="number"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-md bg-blue-400 text-white hover:bg-blue-500 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading progress */}
      {isSimulating && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 text-white">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-400" />
          <p className="text-lg font-semibold">Simulating... {progress}%</p>
        </div>
      )}

      {/* Strategy Flow Modal */}
      {showFlowModal && flowData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl relative w-full max-w-4xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <button
              onClick={() => setShowFlowModal(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl z-10"
            >
              ✕
            </button>

            <div className="p-6">
              <StrategyFlow {...flowData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
