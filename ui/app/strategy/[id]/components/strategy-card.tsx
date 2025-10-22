"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { agentIcons, assetIcons, chainIcons } from "@/lib/iconMap";
import Image from "next/image";
import { CheckCircle2, CircleOff } from "lucide-react";

interface Strategy {
  id: string;
  title: string;
  tags: string[];
  apy: number;
  strategist: string;
  strategistName: string;
  strategistHandle: string;
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

const safeGet = (obj: Record<string, string>, key: string) =>
  obj[key] ||
  obj[key.toUpperCase()] ||
  obj[key.toLowerCase()] ||
  "/icons/default.png";

export function StrategyCard({ strategy }: StrategyCardProps) {
  const isActive = strategy.status === "Active";

  return (
    <Link href={`/strategy/${strategy.id}`}>
      <Card
        className="group relative overflow-hidden p-5 cursor-pointer rounded-2xl
        shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        border border-white/10 bg-gradient-to-br from-black via-[#0c1117] to-[#0d1b26]
        hover:border-primary/50 hover:bg-gradient-to-br hover:from-[#0d1117] hover:to-[#0f2230]"
      >
        {/* Status Badge */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded-full
            ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }
          `}
        >
          {isActive ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <CircleOff className="w-3.5 h-3.5" />
          )}
          {isActive ? "Active" : "Inactive"}
        </div>

        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Tags */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {strategy.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-cyan-500/10 text-cyan-300 text-[11px] border border-cyan-400/20 rounded-md px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-4 text-white group-hover:text-cyan-300 transition-colors leading-tight">
            {strategy.title}
          </h3>

          {/* Strategist & APY */}
          <div className="flex items-baseline justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {strategy.strategistName?.[0]?.toUpperCase() || "P"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {strategy.strategistName}
                </p>
                <p className="text-xs text-gray-400">{strategy.strategistHandle}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">APY</p>
              <p className="text-2xl font-bold text-emerald-400">
                {strategy.apy.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Assets / Agents / Chains */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {/* Asset */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Asset</p>
              <div className="flex gap-1">
                {strategy.assets.slice(0, 2).map((asset) => (
                  <div
                    key={asset}
                    className="w-7 h-7 rounded-full border border-cyan-400/30 overflow-hidden flex items-center justify-center bg-white/5"
                    title={asset}
                  >
                    <Image
                      src={safeGet(assetIcons, asset)}
                      alt={asset}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                ))}
                {strategy.assets.length > 2 && (
                  <div className="w-7 h-7 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center text-[10px] font-bold">
                    +{strategy.assets.length - 2}
                  </div>
                )}
              </div>
            </div>

            {/* Agent */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Agent</p>
              <div className="flex gap-1">
                {strategy.agents.slice(0, 2).map((agent) => (
                  <div
                    key={agent}
                    className="w-7 h-7 rounded-full border border-blue-400/30 overflow-hidden flex items-center justify-center bg-white/5"
                    title={agent}
                  >
                    <Image
                      src={safeGet(agentIcons, agent)}
                      alt={agent}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Chain */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Chain</p>
              <div className="flex gap-1">
                {strategy.chains.slice(0, 2).map((chain) => (
                  <div
                    key={chain}
                    className="w-7 h-7 rounded-full border border-emerald-400/30 overflow-hidden flex items-center justify-center bg-white/5"
                    title={chain}
                  >
                    <Image
                      src={safeGet(chainIcons, chain)}
                      alt={chain}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
