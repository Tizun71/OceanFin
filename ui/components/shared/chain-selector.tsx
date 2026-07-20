"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useSwitchChain } from "wagmi";
import {
  SELECTABLE_CHAINS,
  ChainMeta,
  ChainSlug,
} from "@/config/chains/chain-registry";
import { useActiveChain } from "@/hooks/use-active-chain";
import { displayToast } from "@/components/shared/toast-manager";

const CHAIN_COLORS: Record<ChainSlug, string> = {
  polkadot: "bg-pink-500",
  avalanche: "bg-red-500",
  base: "bg-blue-500",
  arbitrum: "bg-sky-500",
};

const substrateChains = SELECTABLE_CHAINS.filter((c) => c.kind === "substrate");
const evmChains = SELECTABLE_CHAINS.filter((c) => c.kind === "evm");

function ChainBadge({ chain }: { chain: ChainMeta }) {
  return (
    <div
      className={`w-5 h-5 rounded-full ${CHAIN_COLORS[chain.slug]} flex items-center justify-center text-white text-xs font-bold`}
    >
      {chain.name.charAt(0)}
    </div>
  );
}

export function ChainSelector() {
  const { activeChain, setActiveChain } = useActiveChain();
  const { switchChainAsync } = useSwitchChain();

  const handleSelect = (chain: ChainMeta) => {
    if (chain.slug === activeChain.slug) return;
    setActiveChain(chain.slug);

    // For EVM chains, ask the connected wallet to switch networks (explicit
    // chainId avoids stale-state; wallet prompts the user to confirm).
    if (chain.kind === "evm" && chain.chainId) {
      switchChainAsync({ chainId: chain.chainId }).catch(() => {
        displayToast("info", `Switch your wallet to ${chain.name} to continue.`);
      });
    }
  };

  const renderItem = (chain: ChainMeta) => (
    <DropdownMenuItem
      key={chain.slug}
      onClick={() => handleSelect(chain)}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <ChainBadge chain={chain} />
        <span>{chain.name}</span>
      </div>
      {activeChain.slug === chain.slug && <Check className="w-4 h-4" />}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <ChainBadge chain={activeChain} />
          <span>{activeChain.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {substrateChains.length > 0 && (
          <>
            <DropdownMenuLabel>Polkadot</DropdownMenuLabel>
            {substrateChains.map(renderItem)}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel>EVM</DropdownMenuLabel>
        {evmChains.map(renderItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
