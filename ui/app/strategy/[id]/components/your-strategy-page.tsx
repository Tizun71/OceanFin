'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { useStrategies } from '@/hooks/use-strategies';
import { useUser } from '@/providers/user-provider';

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
  const { strategies, loading } = useStrategies(user?.id);

  if (loading) {
    return (
      <div className="text-center py-20 text-neutral-400">
        Loading strategies...
      </div>
    );
  }

  if (!strategies.length) {
    return (
      <div className="text-center py-20 text-neutral-500">
        No strategies found
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
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          {strategy.name}
                        </p>

                        <p className="text-xs text-neutral-500">
                          ID: {strategy.id}
                        </p>
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
                        {tokens.map((symbol, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs"
                            title={symbol as string}
                          >
                            {symbol}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
                      >
                        Publish
                      </Button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="px-4 py-2 rounded-lg bg-primary text-black font-medium hover:opacity-90 transition">
                        Run 
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}