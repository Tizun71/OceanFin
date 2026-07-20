"use client";

import { useCallback, useMemo } from "react";
import { useAccount as useLunoAccount, usePapiSigner } from "@luno-kit/react";
import {
  useAccount as useEvmAccount,
  useDisconnect as useEvmDisconnect,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { WalletClient } from "viem";
import { useActiveChain } from "./use-active-chain";

export type WalletKind = "substrate" | "evm";

export interface UnifiedWallet {
  kind: WalletKind;
  address: string | undefined;
  isConnected: boolean;
  /** EVM only: the chainId the wallet is currently on. */
  walletChainId: number | undefined;
  /** EVM connected but on a different chain than the active selection. */
  needsSwitch: boolean;
  /** Opens the correct connect flow (RainbowKit for EVM). Substrate uses the Luno button. */
  connect: () => void;
  disconnect: () => void;
  /** EVM only: switch the wallet to the active chain. */
  switchToActive: () => Promise<void>;
  /** EVM only: viem WalletClient for writeContract (Phase 2 execution). */
  getWalletClient: () => WalletClient | undefined;
}

/**
 * Chain-aware wallet facade. Hard-partitions substrate (Luno) vs EVM (wagmi)
 * by the active chain kind. Hooks are always called (rules-of-hooks); only the
 * returned values are dispatched on kind. Substrate signing stays in
 * use-luno-papiclient; this facade covers connection state + EVM wallet client.
 */
export function useWallet(): UnifiedWallet {
  const { activeChain, isEvm } = useActiveChain();

  // Substrate (lightweight — no Hydration SDK init here).
  const { address: subAddress } = useLunoAccount();
  const { data: papiSigner } = usePapiSigner();

  // EVM.
  const { address: evmAddress, isConnected: evmConnected, chainId: walletChainId } =
    useEvmAccount();
  const { disconnect: evmDisconnect } = useEvmDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { data: walletClient } = useWalletClient({
    chainId: activeChain.chainId,
  });

  const connect = useCallback(() => {
    if (isEvm) openConnectModal?.();
    // Substrate connect is handled by the Luno ConnectButton in wallet-button.
  }, [isEvm, openConnectModal]);

  const disconnect = useCallback(() => {
    if (isEvm) evmDisconnect();
  }, [isEvm, evmDisconnect]);

  const switchToActive = useCallback(async () => {
    if (isEvm && activeChain.chainId) {
      await switchChainAsync({ chainId: activeChain.chainId });
    }
  }, [isEvm, activeChain.chainId, switchChainAsync]);

  const getWalletClient = useCallback(
    () => (isEvm ? walletClient : undefined),
    [isEvm, walletClient],
  );

  return useMemo<UnifiedWallet>(() => {
    if (isEvm) {
      return {
        kind: "evm",
        address: evmAddress,
        isConnected: evmConnected,
        walletChainId,
        needsSwitch:
          evmConnected &&
          !!activeChain.chainId &&
          walletChainId !== activeChain.chainId,
        connect,
        disconnect,
        switchToActive,
        getWalletClient,
      };
    }
    return {
      kind: "substrate",
      address: subAddress,
      isConnected: !!papiSigner && !!subAddress,
      walletChainId: undefined,
      needsSwitch: false,
      connect,
      disconnect,
      switchToActive,
      getWalletClient,
    };
  }, [
    isEvm,
    evmAddress,
    evmConnected,
    walletChainId,
    activeChain.chainId,
    subAddress,
    papiSigner,
    connect,
    disconnect,
    switchToActive,
    getWalletClient,
  ]);
}
