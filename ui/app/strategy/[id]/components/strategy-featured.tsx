"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { TrendingUp, Droplets, Target, ArrowLeftRight, Info } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchStrategies } from "@/services/strategy-service"
import Image from "next/image"
import { ParticleTextEffect } from "@/components/effect/interactive-text-effect"

export function FeaturedStrategies() {
  const [trendingStrategy, setTrendingStrategy] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrendingStrategy = async () => {
      try {
        const data = await fetchStrategies()
        // Get strategy with highest APY or first active strategy
        const trending = data
          .filter((s: any) => s.status === "Active")
          .sort((a: any, b: any) => b.apy - a.apy)[0]
        setTrendingStrategy(trending)
      } catch (err) {
        console.error("Failed to load trending strategy:", err)
      } finally {
        setLoading(false)
      }
    }

    loadTrendingStrategy()
  }, [])

  const pathCards = [
    {
      icon: TrendingUp,
      title: "Yield Boost",
      description: "Maximize APY with AI-optimized compounding",
      tooltip: "AI automatically compounds your rewards to maximize returns over time",
    },
    {
      icon: Droplets,
      title: "Liquidity Farming",
      description: "Provide liquidity across multiple chains",
      tooltip: "Earn fees by providing liquidity to decentralized exchanges",
    },
    {
      icon: Target,
      title: "Point Campaigns",
      description: "Farm ecosystem points automatically",
      tooltip: "Participate in protocol incentive programs to earn points and rewards",
    },
    {
      icon: ArrowLeftRight,
      title: "Cross-Chain Arbitrage",
      description: "Capture opportunities across ecosystems",
      tooltip: "Automatically find and execute profitable trades across different blockchains",
    },
  ]

  return (
    <div className="h-full w-full space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary"
        >
          <div className="h-30">
            <ParticleTextEffect
              text="OCEAN FIN"
              colors={['56aed6', '298ac3', '00C2CB', '00A6A6', '1e3a59']}
            />
          </div>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-lg text-muted-foreground font-medium"
        >
          Maximize your DeFi growth with smart, automated strategies.
        </motion.p>
      </div>

      {/* Choose Your Path Section */}
      <div className="space-y-4">
        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pathCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 cursor-pointer h-full group transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                            <card.icon className="w-5 h-5 text-primary" />
                          </div>
                          <Info className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-[1.6] font-medium">
                          {card.description}
                        </p>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>{card.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Trending Now Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-primary">
            Trending Now
          </h2>
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full animate-pulse">
            HOT
          </span>
        </div>

        {loading ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">Loading trending strategy...</p>
            </div>
          </Card>
        ) : !trendingStrategy ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No trending strategy available</p>
            </div>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
          >
            <Card className="p-4 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                {/* Left section */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg md:text-xl font-bold text-foreground">
                      {trendingStrategy.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {trendingStrategy.agents?.slice(0, 2).map((agent: string, idx: number) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger>
                            <div className="relative w-6 h-6 rounded-full border border-primary/20 overflow-hidden shadow-md hover:scale-125 transition-transform bg-white">
                              <Image
                                src={agent}
                                alt="Agent"
                                fill
                                className="object-cover p-0.5"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{agent.split('/').pop()?.split('.')[0]}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-[1.6] font-medium">
                    {trendingStrategy.strategistName} - {trendingStrategy.strategistHandle}
                  </p>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {trendingStrategy.tags?.slice(0, 3).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right section */}
                <div className="hidden md:flex items-center gap-3 md:border-l border-border md:pl-4">
                  <motion.div
                    className="text-center px-5 py-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden group/apy shadow-sm"
                    whileHover={{
                      scale: 1.08,
                      borderColor: "rgba(15, 76, 129, 0.4)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/apy:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div
                        className="text-4xl font-black bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent leading-none"
                        style={{ fontFamily: 'var(--font-display, inherit)' }}
                      >
                        {trendingStrategy.apy.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-bold mt-1.5 tracking-widest uppercase">
                        APY
                      </div>
                    </div>
                  </motion.div>
                  <Button
                    size="default"
                    className="bg-primary hover:bg-accent hover:shadow-xl hover:scale-110 transition-all duration-300 text-primary-foreground font-semibold"
                    onClick={() => window.location.href = `/strategy/${trendingStrategy.id}`}
                  >
                    Try Now
                    <motion.div
                      className="ml-2 inline-block"
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      →
                    </motion.div>
                  </Button>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-3 pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <motion.div
                      className="px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden group/apy shadow-sm flex-1"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent opacity-0 group-hover/apy:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-baseline justify-center gap-1.5">
                        <span
                          className="text-3xl font-black bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent"
                          style={{ fontFamily: 'var(--font-display, inherit)' }}
                        >
                          {trendingStrategy.apy.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
                          APY
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  <Button
                    size="default"
                    className="bg-primary hover:bg-accent hover:shadow-lg hover:scale-105 transition-all duration-300 text-primary-foreground w-full font-semibold"
                    onClick={() => window.location.href = `/strategy/${trendingStrategy.id}`}
                  >
                    Try Now
                    <motion.div
                      className="ml-2 inline-block"
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      →
                    </motion.div>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
