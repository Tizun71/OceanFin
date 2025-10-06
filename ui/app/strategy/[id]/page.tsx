import { StrategyHeader } from "@/app/strategy/[id]/components/strategy-header"
import { HeroSection } from "@/components/hero-section"
import { StrategyInput } from "./components/strategy-input"
import { StrategyTabs } from "./components/strategy-tabs"

const strategyData = {
  "1": {
    id: "1",
    title: "Polkadot Liquid Staking - Bifrost",
    status: "Active" as const,
    apy: 42.5,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "15/03/2025",
    description:
      "Implementing a liquid staking strategy by providing DOT liquidity to Bifrost protocol, combining stable yield with exposure to vDOT derivatives and maintaining liquidity through cross-chain operations.",
    agents: ["Bifrost", "Acala"],
    inputAsset: "DOT",
    networkCost: "0.000268 DOT",
    slippage: "1%",
    steps: [
      {
        chain: "Polkadot",
        actions: [
          {
            type: "Stake",
            protocol: "Bifrost",
            asset: "DOT",
            output: "vDOT",
          },
        ],
      },
      {
        chain: "Bifrost",
        actions: [
          {
            type: "Deposit",
            protocol: "Bifrost",
            asset: "vDOT",
          },
        ],
      },
      {
        chain: "Acala",
        actions: [
          {
            type: "Bridge",
            protocol: "XCM",
            asset: "vDOT",
          },
          {
            type: "Swap",
            protocol: "Acala DEX",
            asset: "vDOT",
            output: "aUSD",
          },
        ],
      },
    ],
  },
  "2": {
    id: "2",
    title: "Moonbeam DeFi Yield Optimizer",
    status: "Active" as const,
    apy: 28.75,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "12/03/2025",
    description:
      "Optimizing yield on Moonbeam by leveraging StellaSwap liquidity pools and Moonwell lending markets to maximize returns on GLMR and stablecoin positions.",
    agents: ["StellaSwap", "Moonwell"],
    inputAsset: "GLMR",
    networkCost: "0.001 GLMR",
    slippage: "0.5%",
    steps: [
      {
        chain: "Moonbeam",
        actions: [
          {
            type: "Swap",
            protocol: "StellaSwap",
            asset: "GLMR",
            output: "USDC",
          },
          {
            type: "Deposit",
            protocol: "Moonwell",
            asset: "USDC",
          },
        ],
      },
    ],
  },
}

export default function StrategyPage({ params }: { params: { id: string } }) {
  const strategy = strategyData[params.id as keyof typeof strategyData]

  if (!strategy) {
    return <div>Strategy not found</div>
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 web3-grid">
        <HeroSection />
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <StrategyInput strategy={strategy} />
            </div>
            <div className="lg:col-span-2">
              <StrategyHeader strategy={strategy} />
              <StrategyTabs strategy={strategy} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
