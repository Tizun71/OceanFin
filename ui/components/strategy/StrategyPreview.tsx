"use client";

import { BuildStrategyResponse } from "@/services/ai-strategy-service";
import { StrategySteps } from "./StrategySteps";
import { CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react";

interface StrategyPreviewProps {
  strategy: BuildStrategyResponse;
  onViewDetails?: () => void;
  className?: string;
}

export function StrategyPreview({ strategy, onViewDetails, className = "" }: StrategyPreviewProps) {
  const { steps, validation, metadata } = strategy;

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Strategy Summary */}
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Strategy Generated</h3>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex items-center gap-2 rounded-full bg-violet-600/20 px-3 py-1.5 text-sm text-violet-400 transition hover:bg-violet-600/30"
            >
              <Eye className="h-3 w-3" />
              View Details
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{metadata.totalSteps}</div>
            <div className="text-xs text-white/60">Steps</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${getRiskLevelColor(metadata.riskLevel)}`}>
              {metadata.riskLevel}
            </div>
            <div className="text-xs text-white/60">Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {Math.round(metadata.estimatedGas / 1000)}K
            </div>
            <div className="text-xs text-white/60">Gas</div>
          </div>
        </div>

        {/* Validation Status */}
        <div className="flex items-center gap-2 mb-4">
          {validation.isValid ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Strategy is valid</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">Strategy has errors</span>
            </>
          )}
          
          {validation.warnings.length > 0 && (
            <>
              <AlertTriangle className="h-4 w-4 text-yellow-400 ml-2" />
              <span className="text-sm text-yellow-400">
                {validation.warnings.length} warning{validation.warnings.length > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        {/* Error Messages */}
        {validation.errors.length > 0 && (
          <div className="mb-4 space-y-1">
            {validation.errors.slice(0, 2).map((error, index) => (
              <div key={index} className="text-xs text-red-300 bg-red-400/10 rounded px-2 py-1">
                {error}
              </div>
            ))}
            {validation.errors.length > 2 && (
              <div className="text-xs text-red-300/60">
                +{validation.errors.length - 2} more errors
              </div>
            )}
          </div>
        )}
      </div>

      {/* Strategy Steps Preview */}
      <StrategySteps 
        steps={steps} 
        showHeader={false} 
        compact={true}
        className="max-h-96 overflow-y-auto"
      />
    </div>
  );
}

export default StrategyPreview;