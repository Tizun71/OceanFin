"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check } from "lucide-react"

const chains = [
  { id: "polkadot", name: "Polkadot", icon: "P", color: "bg-primary" },
  { id: "kusama", name: "Kusama", icon: "K", color: "bg-yellow-500" },
  { id: "moonbeam", name: "Moonbeam", icon: "M", color: "bg-teal-500" },
  { id: "astar", name: "Astar", icon: "A", color: "bg-blue-500" },
  { id: "bifrost", name: "Bifrost", icon: "B", color: "bg-purple-500" },
  { id: "acala", name: "Acala", icon: "A", color: "bg-red-500" },
  { id: "hydration", name: "Hydration", icon: "H", color: "bg-cyan-500" },
  { id: "parallel", name: "Parallel", icon: "P", color: "bg-green-500" },
]

export function ChainSelector() {
  const [selectedChain, setSelectedChain] = useState(chains[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <div
            className={`w-5 h-5 rounded-full ${selectedChain.color} flex items-center justify-center text-white text-xs font-bold`}
          >
            {selectedChain.icon}
          </div>
          <span>{selectedChain.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {chains.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => setSelectedChain(chain)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full ${chain.color} flex items-center justify-center text-white text-xs font-bold`}
              >
                {chain.icon}
              </div>
              <span>{chain.name}</span>
            </div>
            {selectedChain.id === chain.id && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
