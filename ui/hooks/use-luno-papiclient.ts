"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePapiSigner, useAccount } from "@luno-kit/react";
import { getHydrationSDK, disconnectHydrationSDK } from "@/api/hydration/external/sdkClient";
import { Chain } from "@luno-kit/core/types";
import { decodeAddress, encodeAddress, isAddress } from "@polkadot/util-crypto";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { hydration } from "@/config/chains/hydration";

export type SendResult = {
  transactionHash: string | null;
  status: "success" | "failed" | "pending";
  errorMessage: string | null;
};

export type Balance = {
  total: string;
  formattedTotal: string;
  transferable?: string;
  formattedTransferable?: string;
};

export type ClientState = {
  client: any | null;
  isReady: boolean;
  isConnecting: boolean;
  error: Error | null;
  currentChain: Chain | null;
};

export function useLunoPapiClient() {
  const { data: papiSigner } = usePapiSigner();
  const { address: walletAddress } = useAccount();

  const clientRef = useRef<any | null>(null);
  const isInitializingRef = useRef(false);

  // State management
  const [state, setState] = useState<ClientState>({
    client: null,
    isReady: false,
    isConnecting: false,
    error: null,
    currentChain: null,
  });

  const [balance, setBalance] = useState<Balance>({
    total: "0",
    formattedTotal: "0",
  });
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Helper: Update state partially
  const updateState = useCallback((updates: Partial<ClientState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper: Cleanup existing client
  const cleanupClient = useCallback(async () => {
    if (clientRef.current) {
      try {
        await disconnectHydrationSDK();
        console.log("Hydration SDK disconnected");
      } catch (error) {
        console.warn("Error disconnecting Hydration SDK:", error);
      }
      clientRef.current = null;
    }
  }, []);

  const initializeClient = useCallback(async () => {
    if (isInitializingRef.current) {
      console.log("Client initialization already in progress");
      return;
    }

    isInitializingRef.current = true;

    try {
      console.log("Initializing Hydration SDK...");

      updateState({
        isReady: false,
        isConnecting: true,
        error: null,
        currentChain: hydration,
        client: null,
      });

      const sdk = await getHydrationSDK();

      if (!sdk || !sdk.api) {
        throw new Error("Failed to initialize Hydration SDK");
      }

      clientRef.current = sdk.api;

      updateState({
        client: sdk.api,
        isReady: true,
        isConnecting: false,
        error: null,
      });

      console.log("Hydration SDK initialized successfully");

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Failed to initialize Hydration SDK:", err);

      updateState({
        error: err,
        isReady: false,
        isConnecting: false,
        client: null,
      });
    } finally {
      isInitializingRef.current = false;
    }
  }, [updateState]);

  const fetchBalance = useCallback(async (targetAddress?: string) => {
    const addressToFetch = targetAddress || walletAddress;

    if (!addressToFetch || !state.client || !state.isReady) {
      console.log("Cannot fetch balance: missing requirements");
      return;
    }

    setLoadingBalance(true);

    try {
      const accountInfo = await state.client.query.system.account(addressToFetch);

      const freeRaw = accountInfo?.data?.free ?? 0;
      const reservedRaw = accountInfo?.data?.reserved ?? 0;

      const freeBigInt = typeof freeRaw === "bigint" ? freeRaw : BigInt(freeRaw?.toString?.() ?? "0");
      const reservedBigInt = typeof reservedRaw === "bigint" ? reservedRaw : BigInt(reservedRaw?.toString?.() ?? "0");
      const totalBigInt = freeBigInt + reservedBigInt;

      const decimals = hydration.nativeCurrency?.decimals ?? 12;
      const divisor = 10 ** decimals;

      setBalance({
        total: totalBigInt.toString(),
        formattedTotal: (Number(totalBigInt) / divisor).toFixed(4),
        transferable: freeBigInt.toString(),
        formattedTransferable: (Number(freeBigInt) / divisor).toFixed(4),
      });

    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance({
        total: "0",
        formattedTotal: "0",
        transferable: "0",
        formattedTransferable: "0",
      });
    } finally {
      setLoadingBalance(false);
    }
  }, [walletAddress, state.client, state.isReady]);

  const sendTransaction = useCallback(
    async (
      tx: any
    ): Promise<SendResult> => {
      return new Promise(async (resolve, reject) => {
        try {
          if (!state.isReady || !state.client) {
            throw new Error("Client not ready");
          }
          const { api } = await getHydrationSDK();
          console.log("[sendTransaction] Wallet address:", walletAddress);
          const nonce = await api.rpc.system.accountNextIndex(walletAddress as string);
          const blockHash = await api.rpc.chain.getBlockHash();

          const ss58Prefix = state.client.registry.chainSS58 ?? 0;
          let formattedFrom = walletAddress;

          if (!isAddress(formattedFrom)) throw new Error(`Invalid fromAddress: ${formattedFrom}`);

          formattedFrom = encodeAddress(decodeAddress(formattedFrom), ss58Prefix);
          await web3Enable("OceanFinApp");

          const injector = await web3FromAddress(formattedFrom);

          const unsub = await tx.signAndSend(
            formattedFrom,
            { signer: injector.signer, nonce, era: 0, blockHash },
            ({ status, dispatchError }: any) => {
              console.log("[sendTransaction] Status:", status.toHuman());

              if (dispatchError) {
                let errorMessage = dispatchError.toString();
                if (dispatchError.isModule) {
                  try {
                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                    const { section, name, docs } = decoded;
                    errorMessage = `${section}.${name}: ${docs.join(" ")}`;
                  } catch (e) {
                    console.warn("Could not decode dispatch error:", e);
                  }
                }
                console.error("[sendTransaction] ❌ DispatchError:", errorMessage);
                unsub();
                resolve({
                  transactionHash: null,
                  status: "failed",
                  errorMessage,
                });
                return;
              }

              if (status.isInBlock) {
                console.log(`[sendTransaction] ✅ Included in block: ${status.asInBlock}`);
                unsub();
                resolve({
                  transactionHash: status.asInBlock.toString(),
                  status: "success",
                  errorMessage: null,
                });
                return;
              } 
              
              if (status.isFinalized) {
                console.log(`[sendTransaction] ✅ Finalized at block: ${status.asFinalized}`);
                unsub();
                resolve({
                  transactionHash: status.asFinalized.toString(),
                  status: "success",
                  errorMessage: null,
                });
              }
            }
          );
        } catch (err: any) {
          console.error("[sendTransaction] ❌ Error while sending tx:", err);
          resolve({
            transactionHash: null,
            status: "failed",
            errorMessage: err?.message ?? String(err),
          });
        }
      });
    },
    [state.isReady, state.client, walletAddress]
  );

  useEffect(() => {
    initializeClient();

    return () => {
      cleanupClient();
    };
  }, [initializeClient, cleanupClient]);

  useEffect(() => {
    if (walletAddress && state.isReady && state.client) {
      fetchBalance();
    }
  }, [walletAddress, state.isReady, state.client, fetchBalance]);

  return {
    client: state.client,
    isReady: state.isReady,
    isConnecting: state.isConnecting,
    error: state.error,
    currentChain: state.currentChain,
    balance,
    loadingBalance,
    refreshBalance: () => fetchBalance(),
    sendTransaction,
    isWalletConnected: !!papiSigner && !!walletAddress,
    walletAddress: walletAddress,
  };
}