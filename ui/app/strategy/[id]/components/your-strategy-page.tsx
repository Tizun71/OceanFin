'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Play, Rocket, Target, Trash2 } from 'lucide-react';
import { useStrategies } from '@/hooks/use-strategies';
import { useUser } from '@/providers/user-provider';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import RunStrategyModal from '@/components/shared/run-strategy-modal';
import Image from "next/image";
import { assetIcons } from '@/lib/iconMap';
import { deleteStrategy } from '@/services/defi-module-service';
import { displayToast } from '@/components/shared/toast-manager';
import ConfirmModal from '@/components/shared/confirm-modal';
import { usePreloader } from '@/providers/preloader-provider';
const ExecutionModal = dynamic(() => import("@/components/shared/execution-modal").then(m => m.ExecutionModal), { ssr: false })

const StatusBadge = ({
  status,
}: {
  status: 'loading' | 'active' | 'paused';
}) => {
  const styles = {
    loading: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    paused: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Badge variant="outline" className={`${styles[status]} text-xs`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const mapStatus = (status: string): 'loading' | 'active' | 'paused' => {
  switch (status) {
    case 'draft':
      return 'loading';
    case 'published':
      return 'active';
    default:
      return 'paused';
  }
};

export default function StrategyTable() {
  const { user } = useUser();
  const { strategies, loading, refetch } = useStrategies(user?.id);
  const [strategyId, setStrategyId] = useState<string | null>(null)
  const [runModal, setRunModal] = useState(false)
  const [executionModal, setExecutionModal] = useState(false)
  const [simulateData, setSimulateData] = useState<any>(null)

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const { show, hide } = usePreloader();
  
  const [openExecution, setOpenExecution] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteStrategy(selectedId);

      displayToast("success", "Strategy deleted successfully");

      refetch(); 
    } catch (error) {
      displayToast("error", "Failed to delete strategy");
    }

    setOpenConfirm(false);
  };
  
  useEffect(() => {
    if (loading) {
      show();
    } else {
      hide();
    }
  }, [loading]);

  // Hide loader when component mounts (after navigation)
  useEffect(() => {
    hide();
  }, [hide]);

  if (!strategies.length) {
    return (
      <div className="text-center py-20 text-neutral-400">
        No strategies yet
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Your Strategies
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage and monitor your DeFi strategies
          </p>
        </div>

      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-neutral-900/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase">
                  Strategy
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase">
                  Steps
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase">
                  Metrics
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase">
                  Tokens
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase">
                  Action
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase">
                  Run Strategy
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {strategies.map((strategy) => {
                const version = strategy.defi_strategy_versions?.find(
                  (v: any) => v.id === strategy.current_version_id
                );

                const steps = version?.workflow_json?.steps || [];

                const tokens = Array.from(
                  new Set(
                    steps.flatMap((step: any) => [
                      step.tokenIn?.symbol,
                      step.tokenOut?.symbol,
                    ])
                  )
                ).filter(Boolean) as string[];

                return (
                  <tr
                    key={strategy.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Strategy Name */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">
                          {strategy.name}
                        </span>

                        <span className="text-[11px] text-neutral-500">
                          {strategy.chain_context} •{" "}
                          {strategy.defi_strategy_versions?.[0]?.workflow_json?.steps?.length || 0} steps
                        </span>
                      </div>
                    </td>

                    {/* Steps */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {strategy.defi_strategy_versions?.[0]?.workflow_json?.steps && (() => {

                          const steps = strategy.defi_strategy_versions[0].workflow_json.steps;
                          const isExpanded = expandedStrategy === strategy.id;

                          const visibleSteps = isExpanded ? steps : steps.slice(0, 3);

                          return (
                            <>
                              {/* Steps */}
                              <div className="text-xs text-neutral-400 flex items-center flex-wrap gap-1">

                                {visibleSteps.map((s: any, index: number) => (
                                  <span key={index}>
                                    {s.type}
                                    {index < visibleSteps.length - 1 && " → "}
                                  </span>
                                ))}

                                {steps.length > 3 && (
                                  <button
                                    onClick={() =>
                                      setExpandedStrategy(isExpanded ? null : strategy.id)
                                    }
                                    className="ml-1 text-indigo-400 hover:text-indigo-300 transition"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                )}

                              </div>

                              {/* Token Flow */}
                              <div className="text-xs text-indigo-400">
                                {[
                                  ...visibleSteps
                                    .map((s: any) => s?.tokenIn?.symbol)
                                    .filter(Boolean),
                                  visibleSteps.at(-1)?.tokenOut?.symbol
                                ]
                                  .filter(Boolean)
                                  .join(" → ")}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={mapStatus(strategy.status)} />
                    </td>

                    {/* Metrics */}
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">APY: --</p>
                    </td>

                    {/* Tokens */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {tokens.map((symbol, i) => {
                          const icon = assetIcons[symbol];

                          return (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                              title={symbol}
                            >
                              {icon ? (
                                <Image
                                  src={icon}
                                  alt={symbol}
                                  width={18}
                                  height={18}
                                  className="rounded-full"
                                />
                              ) : (
                                <span className="text-[10px]">{symbol}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        // onClick={() => handlePublish(strategy.id)}
                        className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition"
                      >
                        <Rocket size={16} />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                        {/* Run */}
                        <button
                          onClick={() => {
                            setStrategyId(strategy.id);
                            setRunModal(true);
                          }}
                          className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition"
                        >
                          <Play size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteClick(strategy.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ConfirmModal
            open={openConfirm}
            title="Delete Strategy"
            message="Are you sure you want to delete this strategy?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancel}
          />
          {strategyId && (
            <RunStrategyModal
              open={runModal}
              onOpenChange={setRunModal}
              strategyId={strategyId}
              onSimulated={(data) => {
                setSimulateData(data)
                setExecutionModal(true)
              }}
            />
          )}
          {strategyId && simulateData && (
            <ExecutionModal
              open={executionModal}
              onOpenChange={setExecutionModal}
              strategy={simulateData}
              strategyId={strategyId}
            />
          )}
        </div>
      </div>
    </div>
  );
}