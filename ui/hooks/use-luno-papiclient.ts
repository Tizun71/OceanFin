// hooks/useLunoPapiClient.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePapiSigner, useAccount } from "@luno-kit/react";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { MultiAddress } from "@polkadot-api/descriptors";
import { Chain, CHAINS } from "@/app/constants";


export type SendResult = {
  transactionHash: string | null;
  status: string;
  errorMessage: string | null;
};

export function useLunoPapiClient() {
  const { data: papiSigner } = usePapiSigner();
  const { address } = useAccount();

  const [client, setClient] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentChain, setCurrentChain] = useState<Chain | null>(CHAINS.polkadot ?? null);
  const [error, setError] = useState<Error | null>(null);

  const [balance, setBalance] = useState<{ total: string; formattedTotal: string; transferable?: string }>({
    total: "0",
    formattedTotal: "0",
  });
  const [loadingBalance, setLoadingBalance] = useState(false);

  // init client for a chain
  const initializeClient = useCallback(async (chain: Chain) => {
    try {
      if (client) {
        try { client.destroy(); } catch { /* ignore */ }
      }
      setIsReady(false);
      setError(null);
      setCurrentChain(chain);

      const c = createClient(
        getWsProvider(chain.endpoint, (_status) => {
          // optional logging
          // console.debug("papi status", _status.type, chain.name);
          if (_status.type === 1) {
            setIsReady(true);
          }
        })
      );

      setClient(c);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsReady(false);
      setClient(null);
    }
  }, [client]);

  // switch chain by id (string key into CHAINS)
  const switchChain = useCallback(async (chainId: string) => {
    const chain = (CHAINS as Record<string, Chain>)[chainId];
    if (!chain) throw new Error(`Unknown chain ${chainId}`);
    await initializeClient(chain);
  }, [initializeClient]);

  // fetch balance for an address on current client/chain
  const fetchBalance = useCallback(async (addr?: string) => {
    if (!addr || !client || !currentChain) return;
    setLoadingBalance(true);
    try {
      // get typed api (descriptors must be provided in CHAINS[*].descriptors)
      const api = client.getTypedApi(currentChain.descriptors);
      // accountInfo: depending on API, use query.System.Account.getValue
      const accountInfo = await api.query.System.Account.getValue(addr);
      // accountInfo.data.free may be BigInt or other
      const freeRaw = accountInfo?.data?.free ?? accountInfo?.free ?? 0;
      // ensure BigInt
      const freeBigInt = typeof freeRaw === "bigint" ? freeRaw : BigInt(freeRaw?.toString?.() ?? "0");
      const decimals = currentChain.nativeCurrency?.decimals ?? 10;
      const formattedTotal = (Number(freeBigInt) / 10 ** decimals).toFixed(4);
      setBalance({
        total: freeBigInt.toString(),
        formattedTotal,
      });
    } catch (err) {
      console.error("fetchBalance error", err);
      setBalance({ total: "0", formattedTotal: "0" });
    } finally {
      setLoadingBalance(false);
    }
  }, [client, currentChain]);

  // send transaction (transfer_keep_alive)
  const sendTransaction = useCallback(async (to: string, amount: string): Promise<SendResult> => {
    if (!isReady || !client || !currentChain) throw new Error("Client not ready");
    if (!papiSigner) throw new Error("PapiSigner not available (wallet not connected or permission missing)");
    // convert amount to planck/atomic units
    const decimals = currentChain.nativeCurrency?.decimals ?? 10;
    // convert to BigInt safely
    const amountNumber = Number(amount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) throw new Error("Invalid amount");
    const amountInPlanck = BigInt(Math.floor(amountNumber * 10 ** decimals));

    const api = client.getTypedApi(currentChain.descriptors);
    const tx = api.tx.Balances.transfer_keep_alive({
      dest: MultiAddress.Id(to),
      value: amountInPlanck,
    });

    return new Promise((resolve, reject) => {
      const sub = tx.signSubmitAndWatch(papiSigner).subscribe({
        next: (event: any) => {
          // event.type examples: 'txBestBlocksState', 'txFinalized', 'txFailed'...
          // adapt depending on runtime events emitted by polkadot-api wrapper
          // when txBestBlocksState or finalized -> resolve
          if (event?.type === "txBestBlocksState" || event?.type === "txFinalized") {
            try { sub.unsubscribe(); } catch {}
            resolve({
              transactionHash: event.txHash ?? null,
              status: "success",
              errorMessage: null,
            });
          } else if (event?.type === "txFailed" || event?.type === "txBroadcastError") {
            try { sub.unsubscribe(); } catch {}
            resolve({
              transactionHash: event.txHash ?? null,
              status: "failed",
              errorMessage: event?.error ?? "unknown error",
            });
          }
          // else continue listening
        },
        error: (err: any) => {
          try { sub.unsubscribe(); } catch {}
          reject(err);
        },
        complete: () => {
          try { sub.unsubscribe(); } catch {}
        }
      });
    });
  }, [client, currentChain, isReady, papiSigner]);

  // initialize default chain once on mount
  useEffect(() => {
    const defaultChain = CHAINS.polkadot ?? Object.values(CHAINS)[0];
    initializeClient(defaultChain);
    // cleanup on unmount
    return () => {
      try { client?.destroy?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once

  // refetch balance when address, client or chain change
  useEffect(() => {
    if (address && isReady && currentChain && client) {
      fetchBalance(address);
    }
  }, [address, isReady, currentChain, client, fetchBalance]);

  return {
    client,
    isReady,
    error,
    currentChain,
    balance,
    loadingBalance,
    availableChains: Object.values(CHAINS),
    switchChain,
    refreshBalance: () => { if (address) fetchBalance(address); },
    sendTransaction,
  };
}
