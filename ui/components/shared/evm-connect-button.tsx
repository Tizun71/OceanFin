"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * EVM wallet connect button. RainbowKit's ConnectButton is already themed to
 * the ocean accent via RainbowKitProvider (see providers/evm-provider.tsx).
 * chainStatus hidden here because network switching is driven by the shared
 * ChainSelector, not the wallet dropdown.
 */
export function EvmConnectButton() {
  return (
    <ConnectButton
      label="Connect Wallet"
      accountStatus="full"
      chainStatus="none"
      showBalance={false}
    />
  );
}
