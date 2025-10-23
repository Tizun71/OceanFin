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
  
  const getAgentGradient = (agents: string[]) => {
    const primaryAgent = agents[0]?.toLowerCase() || '';
    
    const gradients = {
      hydration: 'from-pink-100 to-pink-300/30',
      plasma: 'from-purple-100 to-purple-300/30',
      point: 'from-blue-100 to-blue-300/30',
      hyperevm: 'from-indigo-100 to-indigo-300/30',
      yield: 'from-emerald-100 to-emerald-300/30',
      default: 'from-white to-accent/5'
    };

    // Find the matching gradient or use default
    return Object.entries(gradients).find(([key]) => primaryAgent.includes(key))?.[1] || gradients.default;
  };

  const cardGradient = getAgentGradient(strategy.agents);

  return (
    <Link href={`/strategy/${strategy.id}`}>
      <Card
      className={`group relative overflow-hidden p-5 cursor-pointer rounded-2xl
      shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      border border-accent/10
      bg-gradient-to-br ${cardGradient} backdrop-blur-sm
      hover:border-accent/30
      hover:brightness-105`}
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row gap-4">
        <div className="grid grid-cols-4 gap-4">
        {/* Left Section - Main Info */}
        <div className="flex-1 min-w-0 col-span-3">
          {/* Tags and Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              {strategy.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-accent/10 text-accent text-xs font-medium border border-accent/20 rounded-md px-2.5 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ml-2 flex-shrink-0
                ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "bg-destructive/10 text-destructive border border-destructive/30"
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
          </div>

          {/* Strategist and Title */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-accent">
                {strategy.strategistName?.[0]?.toUpperCase() || "P"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-foreground group-hover:text-accent transition-colors leading-tight mb-1">
                {strategy.title}
              </p>
              <p className="text-sm font-medium text-foreground">
                {strategy.strategistName}
              </p>
              <p className="text-xs text-muted-foreground">{strategy.strategistHandle}</p>
            </div>
          </div>

          {/* Assets / Agents / Chains - Horizontal */}
          <div className="flex items-center gap-6 pt-3 border-t border-accent/10">
            {/* Asset */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Asset</p>
              <div className="flex gap-1">
                {strategy.assets.slice(0, 2).map((asset) => (
                  <div
                    key={asset}
                    className="w-7 h-7 rounded-full border-2 border-accent/20 overflow-hidden flex items-center justify-center bg-white shadow-sm"
                    title={asset}
                  >
                    <img
                      src={safeGet(assetIcons, asset)}
                      alt={asset}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                ))}
                {strategy.assets.length > 2 && (
                  <div className="w-7 h-7 rounded-full bg-accent/10 text-accent border-2 border-accent/20 flex items-center justify-center text-[9px] font-bold shadow-sm">
                    +{strategy.assets.length - 2}
                  </div>
                )}
              </div>
            </div>

            {/* Agent */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agent</p>
              <div className="flex gap-1">
                {strategy.agents.slice(0, 2).map((agent) => (
                  <div
                    key={agent}
                    className="w-7 h-7 rounded-full border-2 border-secondary/20 overflow-hidden flex items-center justify-center bg-white shadow-sm"
                    title={agent}
                  >
                    <img
                      src={safeGet(agentIcons, agent)}
                      alt={agent}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Chain */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chain</p>
              <div className="flex gap-1">
                {strategy.chains.slice(0, 2).map((chain) => (
                  <div
                    key={chain}
                    className="w-7 h-7 rounded-full border-2 border-tertiary/20 overflow-hidden flex items-center justify-center bg-white shadow-sm"
                    title={chain}
                  >
                    <img
                      src={safeGet(chainIcons, chain)}
                      alt={chain}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - APY */}
        <div className="flex md:flex-col items-center md:items-end justify-center md:justify-start text-right flex-shrink-0 md:min-w-[120px] md:border-l border-accent/10 md:pl-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">APY</p>
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent whitespace-nowrap">
              {strategy.apy.toFixed(2)}%
            </p>
          </div>
        </div>
        </div>
      </div>
    </Card>
    </Link>
  );
}
