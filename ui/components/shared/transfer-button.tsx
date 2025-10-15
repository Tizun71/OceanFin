"use client";

import { useState } from "react";
import { useAccount, useBalance } from "@luno-kit/react";

export const TransferButton = () => {
  const { account } = useAccount();
  const address = account?.address;
  const { data: balance } = useBalance({ address });

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!address) {
      setError("⚠️ Please connect your wallet first.");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // --- MOCK LOGIC ---
      await new Promise((r) => setTimeout(r, 2000));
      const fakeHash = "0x" + Math.random().toString(16).slice(2);
      setTxHash(fakeHash);

    } catch (err: any) {
      console.error(err);
      setError("❌ Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center space-y-2">
      <button
        onClick={handleTransfer}
        disabled={!address || loading}
        className={`px-4 py-2 rounded-lg text-white transition ${
          address
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Sending..." : "Transfer"}
      </button>

      {txHash && (
        <p className="text-sm text-green-600 break-all">
          ✅ Transaction sent: <span className="font-mono">{txHash}</span>
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
