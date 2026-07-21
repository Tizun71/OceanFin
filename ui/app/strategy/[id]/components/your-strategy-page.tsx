'use client';

import { Plus, Rocket, Target } from 'lucide-react';
import { useStrategies } from '@/hooks/use-strategies';
import { useUser } from '@/providers/user-provider';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { deleteStrategy, simulateStrategy } from '@/services/defi-module-service';
import { displayToast } from '@/components/shared/toast-manager';
import ConfirmModal from '@/components/shared/confirm-modal';
import { usePreloader } from '@/providers/preloader-provider';
import Link from 'next/link';
import StrategyGridCard from './strategy-grid-card';
import StrategyFlowDrawer from '@/components/shared/strategy-flow-drawer';

const ExecutionModal = dynamic(
  () => import('@/components/shared/execution-modal').then((m) => m.ExecutionModal),
  { ssr: false }
);

export default function StrategyTable() {
  const { user } = useUser();
  const { strategies, loading, refetch } = useStrategies(user?.id);

  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [flowDrawer, setFlowDrawer] = useState(false);
  const [executionModal, setExecutionModal] = useState(false);
  const [simulateData, setSimulateData] = useState<any>(null);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { show, hide } = usePreloader();

  // Amount is baked into the strategy workflow — no user input. Fall back to a
  // sensible default for workflows that seed positions without an entry amount.
  const DEFAULT_AMOUNT = 1000;

  const getPredefinedAmount = (strategy: any): number => {
    const versions = strategy?.defi_strategy_versions ?? [];
    const active =
      versions.find((v: any) => v.id === strategy?.current_version_id) ?? versions[0];
    const firstStep = active?.workflow_json?.steps?.[0];
    return Number(firstStep?.tokenIn?.amount) || DEFAULT_AMOUNT;
  };

  const handleSimulate = async (id: string) => {
    const strategy = strategies.find((s: any) => s.id === id);
    if (!strategy) return;

    setStrategyId(id);
    show();
    try {
      const res = await simulateStrategy(id, getPredefinedAmount(strategy));
      setSimulateData(res);
      setFlowDrawer(true);
      displayToast('success', 'Strategy simulated successfully!');
    } catch {
      displayToast('error', 'Failed to simulate strategy');
    } finally {
      hide();
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteStrategy(selectedId);
      displayToast('success', 'Strategy deleted');
      refetch();
    } catch {
      displayToast('error', 'Failed to delete strategy');
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
    <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Target className="w-6 h-6 text-primary" />
            My strategies
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Simulate a strategy before you commit funds. Pick one to run a dry-run
            with live market data.
          </p>
        </div>

        <Link
          href="/builder"
          className="flex items-center gap-2 px-4 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          New strategy
        </Link>
      </header>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-card border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : strategies.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {strategies.map((strategy) => (
            <StrategyGridCard
              key={strategy.id}
              strategy={strategy}
              onSimulate={handleSimulate}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-card border border-white/10">
          <div className="relative mb-6">
            <Rocket className="w-12 h-12 text-primary/40" />
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10" />
          </div>
          <p className="text-white font-semibold text-lg">No strategies yet</p>
          <p className="text-neutral-500 text-sm mt-1 max-w-xs">
            Build your first DeFi strategy, then simulate it here before running.
          </p>
          <Link
            href="/builder"
            className="mt-6 px-5 h-10 flex items-center bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Open builder
          </Link>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={openConfirm}
        title="Delete strategy"
        message="This removes the strategy and all its versions. This can't be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setOpenConfirm(false)}
      />

      <StrategyFlowDrawer
        open={flowDrawer}
        onOpenChange={setFlowDrawer}
        strategy={simulateData}
        onExecute={() => {
          setFlowDrawer(false);
          setExecutionModal(true);
        }}
      />

      {strategyId && simulateData && (
        <ExecutionModal
          open={executionModal}
          onOpenChange={setExecutionModal}
          strategy={simulateData}
          strategyId={strategyId}
        />
      )}
    </main>
  );
}
