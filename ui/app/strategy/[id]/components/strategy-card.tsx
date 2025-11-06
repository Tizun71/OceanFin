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
  // const isActive = strategy.status === "Active";
  const isActive = "Active";

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
        className={`group relative overflow-hidden p-4 cursor-pointer rounded-xl
      shadow-[0_3px_15px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,209,255,0.15)] hover:-translate-y-1
      border border-accent/15
      bg-gradient-to-br ${cardGradient} backdrop-blur-sm
      hover:border-accent/40
      hover:brightness-105`}
      >
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-secondary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />

        <div className="relative z-10 flex flex-col md:flex-row gap-3">
          <div className="grid grid-cols-4 gap-3">
            {/* Left Section - Main Info */}
            <div className="flex-1 min-w-0 col-span-3">
              {/* Tags and Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-1.5 flex-wrap">
                  {strategy.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-accent/15 text-accent text-xs font-semibold border border-accent/30 rounded-md px-2 py-0.5 shadow-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div
                  className={`flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ml-1.5 flex-shrink-0
                ${isActive
                      ? "bg-green-500/10 text-green-500 border border-green-500/30"
                      : "bg-destructive/10 text-destructive border border-destructive/30"
                    }
              `}
                >
                  {isActive ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <CircleOff className="w-2.5 h-2.5" />
                  )}
                  {isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Strategist and Title */}
              <div className="mb-3">
                <h3 className="text-lg font-black text-foreground group-hover:text-accent transition-colors leading-tight mb-2 tracking-tight">
                  {strategy.title}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">
                    {strategy.strategistName}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/80 font-medium">{strategy.strategistHandle}</p>

              </div>

              {/* Assets / Agents / Chains - Horizontal */}
              <div className="flex items-center gap-5 pt-3 border-t border-accent/15">
                {/* Asset */}
                <div className="flex items-center gap-2 group/item">
                  <p className="text-xs font-bold text-foreground/70 uppercase tracking-wide">Asset</p>
                  <div className="flex gap-1.5">
                    {strategy.assets.slice(0, 2).map((asset, idx) => (
                      <div
                        key={`${asset}-${idx}`}
                        className="relative w-7 h-7 rounded-full border border-accent/30 overflow-hidden shadow-sm hover:scale-110 hover:border-accent/60 transition-all duration-200 bg-white cursor-help"
                        title={asset}
                      >
                        <Image
                          src={asset}
                          alt={asset}
                          fill
                          className="object-cover p-0.5"
                        />
                      </div>
                    ))}
                    {strategy.assets.length > 2 && (
                      <div className="w-7 h-7 rounded-full bg-accent/15 text-accent border border-accent/30 flex items-center justify-center text-[10px] font-bold shadow-sm hover:scale-110 transition-transform duration-200 cursor-help">
                        +{strategy.assets.length - 2}
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent */}
                <div className="flex items-center gap-2 group/item">
                  <p className="text-xs font-bold text-foreground/70 uppercase tracking-wide">Agent</p>
                  <div className="flex gap-1.5">
                    {strategy.agents.slice(0, 2).map((agent, idx) => (
                      <div
                        key={`${agent}-${idx}`}
                        className="relative w-7 h-7 rounded-full border border-secondary/30 overflow-hidden shadow-sm hover:scale-110 hover:border-secondary/60 transition-all duration-200 bg-white cursor-help"
                        title={agent}
                      >
                        <Image
                          src={agent}
                          alt={agent}
                          fill
                          className="object-cover p-0.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chain */}
                <div className="flex items-center gap-2 group/item">
                  <p className="text-xs font-bold text-foreground/70 uppercase tracking-wide">Chain</p>
                  <div className="flex gap-1.5">
                    {strategy.chains.slice(0, 2).map((chain, idx) => (
                      <div
                        key={`${chain}-${idx}`}
                        className="relative w-7 h-7 rounded-full border border-tertiary/30 overflow-hidden shadow-sm hover:scale-110 hover:border-tertiary/60 transition-all duration-200 bg-white cursor-help"
                        title={chain}
                      >
                        <Image
                          src={chain}
                          alt={chain}
                          fill
                          className="object-cover p-0.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - APY */}
            <div className="flex md:flex-col items-center md:items-end justify-center md:justify-start text-right flex-shrink-0 md:min-w-[90px] md:border-l border-accent/10 md:pl-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">APY</p>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent whitespace-nowrap">
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
