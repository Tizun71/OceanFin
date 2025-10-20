// hooks/useLunoPapiClient.ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePapiSigner, useAccount } from "@luno-kit/react";
import { getHydrationSDK, disconnectHydrationSDK } from "@/api/hydration/external/sdkClient";
import { hydration } from "@/config/chains/hydration";
import { Chain } from "@luno-kit/core/types";

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
  const { address } = useAccount();
  
  // Use ref to track client lifecycle
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

  // Initialize client
  const initializeClient = useCallback(async () => {
    // Prevent concurrent initializations
    if (isInitializingRef.current) {
      console.log("Client initialization already in progress");
      return;
    }

    isInitializingRef.current = true;
    
    try {
      console.log("Initializing Hydration SDK...");
      
      // Update state to connecting
      updateState({
        isReady: false,
        isConnecting: true,
        error: null,
        currentChain: hydration,
        client: null,
      });

      // Get Hydration SDK client
      const sdk = await getHydrationSDK();
      
      if (!sdk || !sdk.api) {
        throw new Error("Failed to initialize Hydration SDK");
      }

      clientRef.current = sdk.api;
      
      // Update state to ready
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

  // Fetch balance for current address
  const fetchBalance = useCallback(async (targetAddress?: string) => {
    const addressToFetch = targetAddress || address;
    
    if (!addressToFetch || !state.client || !state.isReady) {
      console.log("Cannot fetch balance: missing requirements");
      return;
    }

    setLoadingBalance(true);
    
    try {
      // Use Hydration SDK to fetch balance
      const accountInfo = await state.client.query.system.account(addressToFetch);
      
      // Extract balance data
      const freeRaw = accountInfo?.data?.free ?? 0;
      const reservedRaw = accountInfo?.data?.reserved ?? 0;
      
      // Convert to BigInt
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
  }, [address, state.client, state.isReady]);

  // Send transaction
  const sendTransaction = useCallback(async (
    to: string, 
    amount: string
  ): Promise<SendResult> => {
    // Validation
    if (!state.isReady || !state.client) {
      throw new Error("Client not ready");
    }
    
    if (!papiSigner) {
      throw new Error("Wallet not connected");
    }

    // Convert amount to atomic units
    const decimals = hydration.nativeCurrency?.decimals ?? 12;
    const amountNumber = Number(amount);
    
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      throw new Error("Invalid amount");
    }
    
    const amountInPlanck = BigInt(Math.floor(amountNumber * 10 ** decimals));

    try {
      // Create transfer transaction
      const tx = state.client.tx.balances.transferKeepAlive(to, amountInPlanck);

      return new Promise((resolve, reject) => {
        tx.signAndSend(papiSigner, ({ status, dispatchError }: any) => {
          if (dispatchError) {
            let errorMessage = "Transaction failed";
            
            if (dispatchError.isModule) {
              try {
                const decoded = state.client.registry.findMetaError(dispatchError.asModule);
                errorMessage = `${decoded.section}.${decoded.name}`;
              } catch {
                errorMessage = dispatchError.toString();
              }
            } else {
              errorMessage = dispatchError.toString();
            }
            
            resolve({
              transactionHash: null,
              status: "failed",
              errorMessage,
            });
            return;
          }

          if (status.isInBlock) {
            resolve({
              transactionHash: status.asInBlock.toString(),
              status: "success",
              errorMessage: null,
            });
          }
        }).catch((error: any) => {
          reject(error);
        });
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }, [state.isReady, state.client, papiSigner]);

  // Initialize client on mount
  useEffect(() => {
    initializeClient();

    // Cleanup on unmount
    return () => {
      cleanupClient();
    };
  }, [initializeClient, cleanupClient]);

  // Auto-fetch balance when conditions are met
  useEffect(() => {
    if (address && state.isReady && state.client) {
      fetchBalance();
    }
  }, [address, state.isReady, state.client, fetchBalance]);

  // Public API
  return {
    // Core state
    client: state.client,
    isReady: state.isReady,
    isConnecting: state.isConnecting,
    error: state.error,
    currentChain: state.currentChain,
    
    // Balance
    balance,
    loadingBalance,
    
    // Actions
    refreshBalance: () => fetchBalance(),
    sendTransaction,
    
    // Utilities
    isWalletConnected: !!papiSigner && !!address,
    walletAddress: address,
  };
}
