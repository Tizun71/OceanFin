"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { useSwitchChain } from "wagmi";
import {
  SELECTABLE_CHAINS,
  ChainMeta,
} from "@/config/chains/chain-registry";
import { useActiveChain } from "@/hooks/use-active-chain";
import { displayToast } from "@/components/shared/toast-manager";

const substrateChains = SELECTABLE_CHAINS.filter((c) => c.kind === "substrate");
const evmChains = SELECTABLE_CHAINS.filter((c) => c.kind === "evm");

/**
 * Chain logo. Uses the registry iconUrl; falls back to a tinted initial when the
 * asset is missing (some chains have no icon in ui/public yet).
 */
function ChainBadge({ chain, size = 20 }: { chain: ChainMeta; size?: number }) {
  const [errored, setErrored] = useState(false);

  if (errored || !chain.iconUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground"
        style={{ width: size, height: size }}
      >
        {chain.name.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={chain.iconUrl}
      alt=""
      width={size}
      height={size}
      className="rounded-full object-contain"
      onError={() => setErrored(true)}
    />
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
      className="flex items-center justify-between gap-3 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <ChainBadge chain={chain} />
        <span>{chain.name}</span>
      </div>
      {activeChain.slug === chain.slug && <Check className="w-4 h-4 text-accent-light" />}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <ChainBadge chain={activeChain} />
          <span className="max-w-[7rem] truncate">{activeChain.name}</span>
          <ChevronDown className="w-4 h-4 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      {/* z-[60]: the header is fixed at z-50, so a z-50 portal can render behind
          it and the menu looks like it never opened. */}
      <DropdownMenuContent align="end" className="w-56 z-[60]">
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
