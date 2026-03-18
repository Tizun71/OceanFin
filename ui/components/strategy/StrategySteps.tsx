"use client";

import { StrategyStep } from "@/services/ai-strategy-service";
import { ArrowRight, Zap, RefreshCw, TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";

interface StrategyStepsProps {
  steps: StrategyStep[];
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

export function StrategySteps({ 
  steps, 
  className = "", 
  showHeader = true, 
  compact = false 
}: StrategyStepsProps) {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'ENABLE_E_MODE':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'SWAP':
        return <RefreshCw className="h-4 w-4 text-blue-400" />;
      case 'SUPPLY':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'BORROW':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'JOIN_STRATEGY':
        return <Target className="h-4 w-4 text-purple-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'ENABLE_E_MODE':
        return 'border-yellow-400/20 bg-yellow-400/5';
      case 'SWAP':
        return 'border-blue-400/20 bg-blue-400/5';
      case 'SUPPLY':
        return 'border-green-400/20 bg-green-400/5';
      case 'BORROW':
        return 'border-red-400/20 bg-red-400/5';
      case 'JOIN_STRATEGY':
        return 'border-purple-400/20 bg-purple-400/5';
      default:
        return 'border-gray-400/20 bg-gray-400/5';
    }
  };

  const formatStepType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAmount = (amount: number) => {
    if (amount < 0.001) {
      return amount.toExponential(3);
    }
    return amount.toFixed(6).replace(/\.?0+$/, '');
  };

  if (steps.length === 0) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-black/25 p-6 backdrop-blur-xl ${className}`}>
        <div className="text-center text-white/60">
          No strategy steps available
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/25 backdrop-blur-xl ${className}`}>
      {showHeader && (
        <div className="border-b border-white/10 p-6 pb-4">
          <h2 className="text-lg font-semibold text-white">Strategy Steps</h2>
          <p className="text-sm text-white/60">{steps.length} steps total</p>
        </div>
      )}
      
      <div className={compact ? "p-4 space-y-2" : "p-6 space-y-4"}>
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Step Card */}
            <div className={`
              rounded-xl border transition-all duration-200 hover:border-white/20
              ${getStepColor(step.type)}
              ${compact ? 'p-3' : 'p-4'}
            `}>
              <div className="flex items-start gap-3">
                {/* Step Number & Icon */}
                <div className="flex items-center gap-2">
                  <div className={`
                    flex items-center justify-center rounded-full border border-white/20 bg-white/10
                    ${compact ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'}
                  `}>
                    {step.step}
                  </div>
                  {getStepIcon(step.type)}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium text-white ${compact ? 'text-sm' : 'text-base'}`}>
                      {formatStepType(step.type)}
                    </h3>
                    <span className={`
                      rounded-full bg-white/10 px-2 py-0.5 font-mono text-white/60
                      ${compact ? 'text-xs' : 'text-xs'}
                    `}>
                      {step.agent}
                    </span>
                  </div>

                  {/* Token Flow */}
                  {(step.tokenIn || step.tokenOut) && (
                    <div className={`flex items-center gap-2 text-white/70 ${compact ? 'text-xs' : 'text-sm'}`}>
                      {step.tokenIn && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-white/90">{step.tokenIn.symbol}</span>
                          <span className="text-white/60">
                            {formatAmount(step.tokenIn.amount)}
                          </span>
                        </div>
                      )}
                      
                      {step.tokenIn && step.tokenOut && (
                        <ArrowRight className="h-3 w-3 text-white/40" />
                      )}
                      
                      {step.tokenOut && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-white/90">{step.tokenOut.symbol}</span>
                          <span className="text-white/60">
                            {formatAmount(step.tokenOut.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Asset IDs (for debugging, can be hidden in production) */}
                  {!compact && (step.tokenIn?.assetId || step.tokenOut?.assetId) && (
                    <div className="mt-1 text-xs text-white/40">
                      {step.tokenIn?.assetId && (
                        <span>In: {step.tokenIn.assetId}</span>
                      )}
                      {step.tokenIn?.assetId && step.tokenOut?.assetId && (
                        <span className="mx-2">•</span>
                      )}
                      {step.tokenOut?.assetId && (
                        <span>Out: {step.tokenOut.assetId}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="h-6 w-px bg-gradient-to-b from-white/20 to-white/5"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StrategySteps;