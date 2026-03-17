"use client";

import { ArrowDown, Workflow, Play } from "lucide-react";
import { motion } from "framer-motion";
import { BuildStrategyResponse, StrategyStep } from "@/services/ai-strategy-service";
import { assetIcons } from "@/lib/iconMap";

interface StrategyFlowPreviewProps {
  strategy: BuildStrategyResponse;
  selectedToken: string;
  onRunStrategy?: () => void;
  className?: string;
}

export function StrategyFlowPreview({ 
  strategy, 
  selectedToken, 
  onRunStrategy, 
  className = "" 
}: StrategyFlowPreviewProps) {
  const { steps, metadata } = strategy;

  const formatAmount = (amount: number) => {
    if (amount < 0.001) {
      return amount.toExponential(3);
    }
    return amount.toFixed(6).replace(/\.?0+$/, '');
  };

  const calculateGasCostUSD = (gasAmount: number) => {
    const dotPrice = 1;
    const gasPerTransaction = 0.01;
    const numberOfTransactions = steps.length;
    
    const totalGasCostDOT = gasPerTransaction * numberOfTransactions;
    const totalGasCostUSD = totalGasCostDOT * dotPrice;
    
    return totalGasCostUSD;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 text-card-foreground rounded-xl border border-border shadow-lg shadow-black/20 transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/20 ${className}`}>
      {/* Header */}
      <div className="border-b border-white/10 p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-400">
            <Workflow className="h-4 w-4" />
            <span className="text-sm font-semibold">Strategy Flow</span>
          </div>
          <div className="text-xs text-white/40">
            {steps.length} steps
          </div>
        </div>
      </div>

      {/* Flow Steps */}
      <div className="p-4">
        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {steps.map((step: StrategyStep, idx: number) => {
            const hasIn = !!step.tokenIn;
            const hasOut = !!step.tokenOut;
            const hasBoth = hasIn && hasOut;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="relative bg-white/[0.02] backdrop-blur-md border border-white/10 
                           rounded-lg hover:border-white/20 transition-all duration-300 p-2"
              >
                {/* Step Header */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 
                                   text-white flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-semibold text-white">
                        {step.type.replace('_', ' ')}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <span className="text-xs">{step.agent}</span>
                  </div>
                </div>

                {/* Token Flow - Compact */}
                <div className="space-y-1">
                  {/* Single line for both tokens */}
                  {(hasIn || hasOut) && (
                    <div className="flex items-center justify-between text-xs bg-white/[0.02] rounded p-1.5">
                      {/* Token In */}
                      {hasIn ? (
                        <div className="flex items-center gap-1 text-white/80">
                          <img 
                            src={assetIcons[step.tokenIn!.symbol] || 
                                 assetIcons[step.tokenIn!.symbol?.toUpperCase()] || 
                                 assetIcons[step.tokenIn!.symbol?.toLowerCase()] || 
                                 "/icons/default.png"}
                            alt={step.tokenIn!.symbol}
                            className="w-4 h-4 rounded-full object-contain bg-white border border-white/20"
                          />
                          <span className="font-medium">{step.tokenIn!.symbol}</span>
                          <span className="text-white/60">{formatAmount(step.tokenIn!.amount)}</span>
                        </div>
                      ) : (
                        <div className="opacity-0">placeholder</div>
                      )}

                      {/* Arrow */}
                      {hasBoth && (
                        <ArrowDown className="w-2 h-2 text-violet-400 -rotate-90" />
                      )}

                      {/* Token Out */}
                      {hasOut ? (
                        <div className="flex items-center gap-1 text-white/80">
                          <img 
                            src={assetIcons[step.tokenOut!.symbol] || 
                                 assetIcons[step.tokenOut!.symbol?.toUpperCase()] || 
                                 assetIcons[step.tokenOut!.symbol?.toLowerCase()] || 
                                 "/icons/default.png"}
                            alt={step.tokenOut!.symbol}
                            className="w-4 h-4 rounded-full object-contain bg-white border border-white/20"
                          />
                          <span className="font-medium">{step.tokenOut!.symbol}</span>
                          <span className="text-white/60">{formatAmount(step.tokenOut!.amount)}</span>
                        </div>
                      ) : (
                        <div className="opacity-0">placeholder</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Connector - smaller */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                      <ArrowDown className="w-2 h-2 text-white/40" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Statistics - Compact */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <img 
                  src={assetIcons[selectedToken] || 
                       assetIcons[selectedToken?.toUpperCase()] || 
                       assetIcons[selectedToken?.toLowerCase()] || 
                       "/icons/default.png"}
                  alt={selectedToken}
                  className="w-4 h-4 rounded-full object-contain bg-white border border-white/20"
                />
              </div>
              <div className="text-xs font-semibold text-white">
                {selectedToken}
              </div>
              <div className="text-xs text-white/50">Initial</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="invisible w-3 h-3 rounded-full bg-white/[0.06] border border-white/10"></div>
              </div>
              <div className={`text-xs font-semibold ${getRiskColor(metadata.riskLevel)}`}>
                {metadata.riskLevel}
              </div>
              <div className="text-xs text-white/50">Risk</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="invisible w-3 h-3 rounded-full bg-white/[0.06] border border-white/10"></div>
              </div>
              <div className="text-xs font-semibold text-white">
                ${calculateGasCostUSD(metadata.estimatedGas).toFixed(2)}
              </div>
              <div className="text-xs text-white/50">Est. Gas Cost</div>
            </div>
          </div>

          {/* Run Strategy Button - Compact */}
          {onRunStrategy && (
            <button
              onClick={onRunStrategy}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/15 hover:bg-white/[0.09] hover:text-white shadow-lg hover:shadow-xl"
            >
              <Play className="h-3 w-3" />
              Run Strategy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StrategyFlowPreview;