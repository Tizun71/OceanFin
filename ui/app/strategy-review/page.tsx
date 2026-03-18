"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react";
import { displayToast } from "@/components/shared/toast-manager";
import { BuildStrategyResponse } from "@/services/ai-strategy-service";
import { StrategySteps } from "@/components/strategy/StrategySteps";

interface StoredStrategy {
  name: string;
  result: BuildStrategyResponse;
  selectedToken: string;
  prompt: string;
}

function StrategyReview() {
  const router = useRouter();
  const [strategy, setStrategy] = useState<StoredStrategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('generatedStrategy');
      if (stored) {
        const parsedStrategy = JSON.parse(stored) as StoredStrategy;
        setStrategy(parsedStrategy);
      } else {
        displayToast("error", "No strategy found. Please generate a strategy first.");
        router.push("/prompt");
      }
    } catch (error) {
      console.error("Failed to load strategy:", error);
      displayToast("error", "Failed to load strategy data.");
      router.push("/prompt");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleBack = () => {
    router.push("/prompt");
  };

  const handleExecute = () => {
    if (strategy) {
      // Store strategy for execution
      localStorage.setItem('strategyToExecute', JSON.stringify(strategy));
      router.push("/execute");
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading strategy...</div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">No strategy found</div>
      </div>
    );
  }

  const { result, name, selectedToken, prompt } = strategy;
  const { steps, validation, metadata, aiAnalysis } = result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-white">{name}</h1>
              <p className="text-sm text-white/60">Strategy Review</p>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!validation.isValid}
            className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Execute Strategy
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Strategy Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Prompt */}
            <div className="rounded-2xl border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold text-white">Original Prompt</h2>
              <div className="space-y-2">
                <div className="text-sm text-white/60">
                  <span className="font-medium">Starting Token:</span> {selectedToken}
                </div>
                <div className="rounded-lg bg-white/5 p-3 text-sm text-white/80">
                  {prompt}
                </div>
              </div>
            </div>

            {/* Strategy Steps */}
            <StrategySteps steps={steps} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Validation Status */}
            <div className="rounded-2xl border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-semibold text-white">Validation</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={validation.isValid ? "text-green-400" : "text-red-400"}>
                    {validation.isValid ? "Valid Strategy" : "Invalid Strategy"}
                  </span>
                </div>

                {validation.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-red-400">Errors:</div>
                    {validation.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-300">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-yellow-400">Warnings:</div>
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="text-xs text-yellow-300">
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Strategy Metadata */}
            <div className="rounded-2xl border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-semibold text-white">Strategy Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Total Steps:</span>
                  <span className="text-sm text-white">{metadata.totalSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Estimated Gas:</span>
                  <span className="text-sm text-white">{metadata.estimatedGas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Risk Level:</span>
                  <span className={`text-sm ${getRiskLevelColor(metadata.riskLevel)}`}>
                    {metadata.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">AI Generated:</span>
                  <span className="text-sm text-white">
                    {metadata.aiGenerated ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {aiAnalysis && (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-lg font-semibold text-white">AI Analysis</h3>
                
                {aiAnalysis.riskFactors.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Risk Factors</span>
                    </div>
                    <div className="space-y-1">
                      {aiAnalysis.riskFactors.map((factor, index) => (
                        <div key={index} className="text-xs text-white/60">
                          • {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiAnalysis.recommendations.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Recommendations</span>
                    </div>
                    <div className="space-y-1">
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="text-xs text-white/60">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StrategyReviewPage() {
  return <StrategyReview />;
}