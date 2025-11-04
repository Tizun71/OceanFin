"use client"

import React from "react"

export default function StrategyPromptDetails() {
  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Strategy Prompt Details
      </h2>

      {/* Basic Info */}
      <div className="mb-6 space-y-1">
        <h3 className="text-lg font-semibold text-blue-600">g-dotloping</h3>
        <p className="text-sm text-gray-600">
          by <span className="text-black font-medium">Alice</span>{" "}
          <span className="text-gray-500">@alice-defi</span>
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
            Yield
          </span>
          <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
            Stablecoin
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">
          Strategy Description
        </h4>
        <p className="text-gray-700 text-sm leading-relaxed">
          The <span className="text-black font-medium">g-dotloping</span> strategy
          focuses on exploiting interest rate differentials between stablecoin
          markets on the Ethereum chain.{" "}
          <span className="text-blue-600">BotAlpha</span> automatically balances
          between USDe and ETH staking pools to optimize overall APY.{" "}
          <span className="text-purple-600">VaultX</span> ensures liquidity by
          managing short-term asset allocations efficiently.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Total Liquidity</p>
          <p className="text-black font-medium">$139.43M</p>
        </div>
        <div>
          <p className="text-gray-600">24h Volume</p>
          <p className="text-black font-medium">$24.55M</p>
        </div>
        <div>
          <p className="text-gray-600">Best Fixed APY</p>
          <p className="text-green-600 font-semibold">6.21%</p>
        </div>
        <div>
          <p className="text-gray-600">Best Long Yield APY</p>
          <p className="text-red-600 font-semibold">-91.43%</p>
        </div>
        <div>
          <p className="text-gray-600">Chain</p>
          <p className="text-black">Ethereum</p>
        </div>
        <div>
          <p className="text-gray-600">Status</p>
          <p className="text-green-600">Active</p>
        </div>
      </div>

      {/* Logic */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">
          Strategy Logic
        </h4>
        <ul className="list-decimal list-inside text-gray-700 text-sm space-y-1">
          <li>Collect liquidity from the USDe pool.</li>
          <li>Swap 50% into ETH to maintain asset ratio.</li>
          <li>Stake assets into Protocol A for optimized yield.</li>
          <li>Auto-rebalance every 24 hours.</li>
        </ul>
      </div>

      {/* Links */}
      <div className="mt-6 text-sm space-y-1">
        <a
          href="#"
          className="text-blue-600 hover:underline"
        >
          🔗 View on Etherscan
        </a>
        <a
          href="#"
          className="text-blue-600 hover:underline"
        >
          📘 Strategy Documentation
        </a>
      </div>
    </div>
  )
}
