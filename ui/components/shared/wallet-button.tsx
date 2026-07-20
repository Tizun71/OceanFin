"use client";

import { EvmConnectButton } from "./evm-connect-button";

/**
 * App-wide connect button. EVM/RainbowKit only — the LunoKit (substrate) wallet
 * rail is disabled along with the Polkadot chain (see POLKADOT_ENABLED in
 * config/chains/chain-registry).
 */
export function WalletButton() {
  return <EvmConnectButton />;
}
