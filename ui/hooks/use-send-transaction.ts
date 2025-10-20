"use client";

import { useCallback, useState } from "react";
import { usePapiSigner, useAccount } from "@luno-kit/react";
import { useLunoPapiClient } from "./use-luno-papiclient";

export type TransactionResult = {
  txHash: string | null;
  status: "success" | "failed";
  error?: string;
};

export type TransactionPreview = {
  tx: any;
  step: any;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function useSendTransaction() {
  const { data: papiSigner } = usePapiSigner();
  const { address } = useAccount();
  const { client, isReady, currentChain } = useLunoPapiClient();

  const [pendingTransaction, setPendingTransaction] = useState<TransactionPreview | null>(null);
  const [isSigningTransaction, setIsSigningTransaction] = useState(false);

  const executeTransactionDirect = useCallback(
    async (tx: any): Promise<TransactionResult> => {
      if (!isReady || !client || !currentChain) {
        return { txHash: null, status: "failed", error: "Client not ready" };
      }

      if (!papiSigner) {
        return { txHash: null, status: "failed", error: "Wallet not connected" };
      }

      if (!address) {
        return { txHash: null, status: "failed", error: "No wallet address found" };
      }

      try {
        // Use polkadot-api pattern with signSubmitAndWatch
        return new Promise((resolve, reject) => {
          console.log("Submitting transaction:", tx);
          const sub = tx.signSubmitAndWatch(papiSigner).subscribe({
            next: (event: any) => {
              console.log("Transaction event:", event);

              if (event?.type === "txBestBlocksState" || event?.type === "txFinalized") {
                try {
                  sub.unsubscribe();
                } catch {}
                resolve({
                  txHash: event.txHash ?? null,
                  status: "success",
                });
              } else if (event?.type === "txFailed" || event?.type === "txBroadcastError") {
                try {
                  sub.unsubscribe();
                } catch {}
                resolve({
                  txHash: event.txHash ?? null,
                  status: "failed",
                  error: event?.error ?? "Transaction failed",
                });
              } else if (event?.type === "txInvalid") {
                try {
                  sub.unsubscribe();
                } catch {}
                resolve({
                  txHash: null,
                  status: "failed",
                  error: "Transaction is invalid",
                });
              }
            },
            error: (err: any) => {
              console.error("Transaction error:", err);
              try {
                sub.unsubscribe();
              } catch {}
              resolve({
                txHash: null,
                status: "failed",
                error: err.message || "Unknown error",
              });
            },
            complete: () => {
              try {
                sub.unsubscribe();
              } catch {}
            },
          });
        });
      } catch (error: any) {
        return { txHash: null, status: "failed", error: error.message };
      }
    },
    [isReady, client, currentChain, papiSigner, address]
  );

  const executeTransaction = useCallback(
    async (tx: any, step?: any, showPreview: boolean = false): Promise<TransactionResult> => {
      if (showPreview) {
        // Show preview modal and wait for user confirmation
        return new Promise((resolve, reject) => {
          const handleConfirm = async () => {
            setIsSigningTransaction(true);
            try {
              const result = await executeTransactionDirect(tx);
              resolve(result);
            } catch (err) {
              reject(err);
            } finally {
              setIsSigningTransaction(false);
              setPendingTransaction(null);
            }
          };

          const handleCancel = () => {
            setPendingTransaction(null);
            resolve({
              txHash: null,
              status: "failed",
              error: "Transaction cancelled by user",
            });
          };

          setPendingTransaction({
            tx,
            step,
            onConfirm: handleConfirm,
            onCancel: handleCancel,
          });
        });
      } else {
        // Execute directly without preview
        setIsSigningTransaction(true);
        try {
          const result = await executeTransactionDirect(tx);
          return result;
        } finally {
          setIsSigningTransaction(false);
        }
      }
    },
    [executeTransactionDirect]
  );

  return {
    executeTransaction,
    isReady: isReady && !!papiSigner && !!address,
    isSigningTransaction,
    pendingTransaction,
    address,
    currentChain,
    clearPendingTransaction: () => setPendingTransaction(null),
  };
}
