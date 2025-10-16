"use client";

import React, { useState } from "react";
import {
  useConnect,
  useDisconnect,
  useAccount,
  useBalance,
  useSignMessage,
} from "@luno-kit/react";
import { useLunoPapiClient } from "@/hooks/use-luno-papiclient";

export default function WalletPage() {
  const { address } = useAccount();
  const {
    isReady,
    balance,
    loadingBalance,
    availableChains,
    switchChain,
    sendTransaction,
    refreshBalance,
    currentChain
  } = useLunoPapiClient();
  const { connectors, connect } = useConnect();
  const { account } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1.0");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!address) return alert("⚠️ Please connect your wallet first");
    if (!recipient) return alert("⚠️ Enter recipient address");
    if (!amount || Number(amount) <= 0) return alert("⚠️ Enter a valid amount > 0");

    try {
        setStatus("⏳ Waiting for wallet signature...");
        setTxHash(null);

        // Send transaction to Luno PAPI client
        const res = await sendTransaction(recipient.trim(), amount);

        console.log("Transaction result:", res);

        if (res?.status === "success") {
        setStatus("✅ Transaction confirmed!");
        setTxHash(res.transactionHash);

        setTimeout(() => refreshBalance(), 2000);
        } else {
        setStatus("❌ Failed: " + (res?.errorMessage || "Unknown error"));
        }
    } catch (err: any) {
        console.error("Transfer error:", err);
        setStatus("❌ Error: " + (err?.message || String(err)));
    }
    };

  return (
    <div className="min-h-screen bg-white p-10 text-gray-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Theme Control */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">🎨 Theme Control</h2>
          <p className="text-sm mb-2 text-gray-600">Current Theme: Light</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
              Light
            </button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
              Dark
            </button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
              Auto
            </button>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">💳 Wallet Connection</h2>

          {!account ? (
            <div className="flex flex-col gap-2">
              {connectors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => connect({ connectorId: c.id })}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                >
                  Connect {c.name}
                </button>
              ))}
            </div>
          ) : (
            <>
              <p className="text-green-600 mb-2 font-medium">✅ Connected</p>
              <p className="break-all text-sm text-gray-700">
                {account.address}
              </p>
              <button
                onClick={() => disconnect()}
                className="mt-3 px-3 py-1 bg-red-100 text-red-600 border border-red-200 rounded hover:bg-red-200 transition"
              >
                Disconnect
              </button>
            </>
          )}
        </div>

        {/* PAPI Status */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md transition hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-3">🛰️ PAPI Status</h2>

            {isReady ? (
                <p className="text-green-600 font-medium">✅ Connected</p>
            ) : (
                <p className="text-yellow-600 font-medium">⏳ Connecting...</p>
            )}

            <p className="text-sm text-gray-700 mt-2">
                Network:&nbsp;
                <span className="font-semibold">
                {currentChain?.name ?? "Not connected"}
                </span>
            </p>

            <p className="text-xs text-gray-500 mt-1">
                Endpoint:&nbsp;
                <span className="font-mono">
                {currentChain?.endpoint ?? "—"}
                </span>
            </p>
        </div>

        {/* Balance */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">💰 Balance</h2>
          <p >{loadingBalance ? "..." : `${balance.formattedTotal} ${currentChain?.nativeCurrency?.symbol ?? ""}`}</p>
        </div>

        {/* Account Management */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">👤 Account Management</h2>
          <p className="text-sm text-gray-700 break-all">
            {account?.address ?? "No account connected"}
          </p>
        </div>

        {/* Sign Message */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">✍️ Sign Message</h2>
          <button
            onClick={async () => {
              const sig = await signMessageAsync({ message: "Test message" });
              alert(`Signature: ${sig}`);
            }}
            disabled={!account}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded disabled:opacity-50 transition"
          >
            Sign Test Message
          </button>
        </div>

        {/* Chain Management */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md transition hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-3">⛓️ Chain Management</h2>
            {availableChains?.map((chain) => (
                <button
                key={chain.id}
                onClick={() => switchChain(chain.id)}
                className="w-full mb-2 px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                Switch to {chain.name}
                </button>
            ))}
            {currentChain && (
                <p className="mt-4 text-sm text-indigo-600 font-medium">
                Current Chain: {currentChain.name}
                </p>
            )}
        </div>

        {/* 🚀 Send Transaction */}
        <div className="rounded-2xl bg-gray-100 p-6 shadow-md md:col-span-2">
        <h2 className="text-xl font-semibold mb-3">🚀 Send Transaction</h2>

        {/* To Address Input */}
        <label className="block text-sm mb-1 font-medium text-gray-700">
            Recipient Address:
        </label>
        <input
            type="text"
            placeholder="Enter destination address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Amount Input */}
        <label className="block text-sm mb-1 font-medium text-gray-700">
            Amount ({currentChain?.nativeCurrency?.symbol ?? "DOT"}):
        </label>
        <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mb-4 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Send Button */}
        <button
            onClick={handleTransfer}
            disabled={!isReady || !address || loadingBalance}
            className={`w-full px-4 py-2 rounded-lg text-white font-medium transition 
            ${
                !isReady || loadingBalance
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
        >
            {loadingBalance ? "Loading..." : "Send Transaction"}
        </button>

        {/* Transaction Status */}
        {status && (
            <p
            className={`mt-3 text-sm ${
                status.includes("✅")
                ? "text-green-600"
                : status.includes("❌")
                ? "text-red-600"
                : "text-gray-600"
            }`}
            >
            {status}
            </p>
        )}

        {/* Transaction Hash */}
        {txHash && (
            <div className="mt-3">
            <p className="text-sm font-medium text-gray-800">Transaction Hash:</p>
            <p className="text-xs text-green-600 break-all">{txHash}</p>
            <a
                href={`https://polkadot.subscan.io/extrinsic/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 underline mt-1 inline-block"
            >
                View on Subscan →
            </a>
            </div>
        )}
        </div>

      </div>
    </div>
  );
}
