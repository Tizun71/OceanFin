"use client";

import { ConnectButton } from "@luno-kit/ui";

export function WalletButton() {
  return (
    <ConnectButton
      label="Connect Wallet"
      accountStatus="full"
      chainStatus="full"
      showBalance={true}
    />
  );
}