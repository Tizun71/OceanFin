'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  status: 'loading' | 'active' | 'paused';
  tokens: { symbol: string; icon: string }[];
  metrics: {
    apy: string;
    tvl: string;
    users: number;
  };
}

const MOCK_STRATEGIES: Strategy[] = [
  {
    id: '1',
    name: 'Leverage Lending - zkEVM Reward',
    status: 'loading',
    tokens: [{ symbol: 'USDC', icon: '💙' }, { symbol: 'ETH', icon: '⟠' }],
    metrics: {
      apy: '13.34%',
      tvl: '$2.4M',
      users: 1250,
    },
  },
  {
    id: '2',
    name: 'Stable Interest Money',
    status: 'active',
    tokens: [{ symbol: 'DAI', icon: '🟨' }, { symbol: 'USDC', icon: '💙' }],
    metrics: {
      apy: '18.81%',
      tvl: '$5.2M',
      users: 2840,
    },
  },
  {
    id: '3',
    name: 'PT yzUSD (23-June) Looping (Weighted)',
    status: 'active',
    tokens: [{ symbol: 'yzUSD', icon: '🔷' }, { symbol: 'PT', icon: '⬛' }],
    metrics: {
      apy: '6.17%',
      tvl: '$1.8M',
      users: 642,
    },
  },
  {
    id: '4',
    name: 'veODIE - Morphe',
    status: 'paused',
    tokens: [{ symbol: 'ODIE', icon: '🟢' }, { symbol: 'veODIE', icon: '💚' }],
    metrics: {
      apy: '5.23%',
      tvl: '$890K',
      users: 356,
    },
  },
  {
    id: '5',
    name: 'Earn Yield With Your Bitcoin',
    status: 'active',
    tokens: [{ symbol: 'BTC', icon: '🟠' }, { symbol: 'USDC', icon: '💙' }],
    metrics: {
      apy: '3.44%',
      tvl: '$12.1M',
      users: 5120,
    },
  },
];

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

const ReturnBadge = ({ value }: { value: number }) => {
  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-1.5">
      {isPositive ? (
        <ArrowUpRight className="w-4 h-4 text-green-400" />
      ) : (
        <ArrowDownRight className="w-4 h-4 text-red-400" />
      )}
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}
        {value.toFixed(2)}%
      </span>
    </div>
  );
};

const RiskBadge = ({ risk }: { risk: 'low' | 'medium' | 'high' }) => {
  const styles = {
    low: 'bg-green-500/10 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <Badge variant="outline" className={`${styles[risk]} text-xs`}>
      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
    </Badge>
  );
};

export default function StrategyTable() {
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

      {/* Table Container */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-neutral-900/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_STRATEGIES.map((strategy, idx) => (
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
                      <p className="text-xs text-neutral-500">ID: {strategy.id}</p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={strategy.status} />
                  </td>

                  {/* Metrics */}
                  <td className="px-6 py-4">
                    <div className="space-y-0.5 text-sm">
                      <p className="text-white font-medium">
                        APY: {strategy.metrics.apy}
                      </p>
                    </div>
                  </td>

                  {/* Tokens */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {strategy.tokens.map((token, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm"
                          title={token.symbol}
                        >
                          {token.icon}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
