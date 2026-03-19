'use client';

import { ChevronDown, ChevronUp, Play, Rocket, Target, Trash2, Cpu, Plus } from 'lucide-react';
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
import Link from 'next/link';

const ExecutionModal = dynamic(() => import("@/components/shared/execution-modal").then(m => m.ExecutionModal), { ssr: false })

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
    if (loading) show();
    else hide();
  }, [loading, show, hide]);

  useEffect(() => {
    hide();
  }, [hide]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 py-8">
     {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2 tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <Target className="w-6 h-6 text-primary" />
            Strategy Hub
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-neutral-400 font-medium">
              Automated DeFi management
            </p>
        
            {!loading && strategies.length > 0 && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-tertiary/80 bg-tertiary/5 px-2 py-0.5 rounded border border-tertiary/10">
                <Cpu className="w-3 h-3" />
                {strategies.length} Active
              </div>
            )}
          </div>
        </div>

        <Link 
          href="/builder" 
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95 group"
        >
          <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          New Strategy
        </Link>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="glass rounded-xl overflow-hidden border-white/10 shadow-2xl backdrop-blur-2xl min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center animate-pulse">
            <span className="text-[10px] font-black tracking-[0.3em] text-white/10 uppercase">Synchronizing...</span>
          </div>
        ) : strategies.length > 0 ? (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-separate border-spacing-0 table-fixed">
              <thead>
                <tr className="bg-neutral-900/40 border-b border-white/5">
                  <th className="w-[20%] px-4 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Strategy</th>
                  <th className="w-[50%] px-4 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Workflow & Path</th>
                  <th className="w-[15%] px-4 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">Assets</th>
                  <th className="w-[15%] px-4 py-4 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {strategies.map((strategy) => {
                  const version = strategy.defi_strategy_versions?.find(
                    (v: any) => v.id === strategy.current_version_id
                  );
                  const steps = version?.workflow_json?.steps || [];
                  
                  const tokens = Array.from(
                    new Set(steps.flatMap((step: any) => [step.tokenIn?.symbol, step.tokenOut?.symbol]))
                  ).filter(Boolean) as string[];

                  return (
                    <tr key={strategy.id} className="group hover:bg-white/[0.01] transition-all duration-300">
                      {/* STRATEGY NAME */}
                      <td className="px-4 py-5 align-top">
                        <div className="flex flex-col gap-1.5 max-w-[200px]"> 
                          <span 
                            className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 break-words"
                            title={strategy.name} 
                          >
                            {strategy.name}
                          </span>
                          <span className="text-[9px] w-fit px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-500 font-black uppercase tracking-tighter">
                            {strategy.context || 'Hydration'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5 align-top">
                        <div className="flex flex-col gap-4">
                          {strategy.defi_strategy_versions?.[0]?.workflow_json?.steps && (() => {
                            const steps = strategy.defi_strategy_versions[0].workflow_json.steps;
                            const isExpanded = expandedStrategy === strategy.id;
                            const visibleSteps = isExpanded ? steps : steps.slice(0, 3);

                            return (
                              <>
                                {/*  Workflow Capsules  */}
                                <div className="flex items-center flex-wrap gap-1.5 min-h-[24px]">
                                  {visibleSteps.map((s: any, index: number) => (
                                    <div key={index} className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/5 border border-accent/10 text-accent-light uppercase tracking-tight">
                                        {s.type}
                                      </span>
                                      {index < visibleSteps.length - 1 && (
                                        <span className="text-neutral-700 text-[10px]">/</span>
                                      )}
                                    </div>
                                  ))}

                                  {steps.length > 3 && (
                                    <button
                                      onClick={() => setExpandedStrategy(isExpanded ? null : strategy.id)}
                                      className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                      {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                    </button>
                                  )}
                                </div>

                                {/* Token Flow */}
                                <div className="flex items-center flex-wrap gap-y-2 gap-x-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 w-fit max-w-full">
                                  {(() => {
                                    const sequence = [
                                      ...steps.map((s: any) => s?.tokenIn?.symbol).filter(Boolean),
                                      steps.at(-1)?.tokenOut?.symbol
                                    ].filter(Boolean);

                                    const uniqueSequence = sequence.filter((sym, i) => sym !== sequence[i - 1]);

                                    return uniqueSequence.map((symbol, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5">
                                        {/* Token Badge */}
                                        <div className="flex items-center gap-1.5 bg-neutral-900/50 pl-0.5 pr-2 py-0.5 rounded-full border border-white/20 shadow-inner group/token">
                                          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/40 bg-black flex-shrink-0">
                                            {assetIcons[symbol] ? (
                                              <Image 
                                                src={assetIcons[symbol]} 
                                                alt={symbol} 
                                                width={20} 
                                                height={20} 
                                                className="object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-[6px] font-black text-white">
                                                {symbol?.slice(0, 2)}
                                              </div>
                                            )}
                                          </div>
                                          <span className="text-[9px] font-bold text-white/90 uppercase tracking-tight">
                                            {symbol}
                                          </span>
                                        </div>

                                        {/* Arrow Connector */}
                                        {idx < uniqueSequence.length - 1 && (
                                          <div className="flex items-center px-0.5">
                                            <div className="w-2.5 h-[1.5px] bg-primary/40 rounded-full" />
                                            <svg 
                                              width="12" 
                                              height="12" 
                                              viewBox="0 0 24 24" 
                                              fill="none" 
                                              className="text-primary/70 ml-[-4px]" 
                                              stroke="currentColor" 
                                              strokeWidth="4" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                            >
                                              <path d="m9 18 6-6-6-6"/>
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    ));
                                  })()}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </td>

                      {/* ASSETS ICONS */}
                      <td className="px-4 py-5 align-top">
                        <div className="flex items-center justify-center -space-x-2 group-hover:space-x-1 transition-all duration-500">
                          {tokens.map((symbol, i) => (
                            <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.15)] hover:scale-110 hover:z-50 transition-transform relative"
                            style={{ zIndex: 10 - i }}
                            title={symbol}
                          >
                            {assetIcons[symbol] ? (
                              <Image 
                                src={assetIcons[symbol]} 
                                alt={symbol} 
                                fill 
                                sizes="20px"
                                className="object-cover scale-110" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                                <span className="text-[7px] font-black text-white">{symbol}</span>
                              </div>
                            )}
                          </div>
                          ))}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-5 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setStrategyId(strategy.id); setRunModal(true); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-black text-[10px] transition-all border border-primary/20 shadow-sm"
                          >
                            <Play size={10} fill="currentColor" />
                            RUN
                          </button>

                          <button
                            onClick={() => handleDeleteClick(strategy.id)}
                            className="p-2 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/10"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // --- EMPTY STATE ---
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-6">
               <Rocket className="w-12 h-12 text-primary/20 float opacity-60" />
               <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10" />
            </div>
            <p className="text-white font-bold text-lg tracking-tight">Strategy vault is empty</p>
            <p className="text-neutral-500 text-sm mt-1 italic max-w-[250px]">
              You haven't created any strategies yet. Start your journey now.
            </p>
            <Link 
              href="/builder" 
              className="mt-8 px-6 py-2.5 bg-primary text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-glow"
            >
              Launch Builder
            </Link>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <ConfirmModal
        open={openConfirm}
        title="Delete Strategy"
        message="Are you sure you want to delete this module?"
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
  );
}