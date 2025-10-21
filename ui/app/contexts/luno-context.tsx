"use client";

import React, { createContext, useContext, useMemo } from "react";
import { 
  useConnect, 
  useDisconnect, 
  useAccount, 
  useBalance, 
  useChain,
  useStatus 
} from "@luno-kit/react"; 

interface LunoContextValue {
  connect: ReturnType<typeof useConnect>["connectAsync"];
  disconnect: ReturnType<typeof useDisconnect>["disconnectAsync"];
  address?: string;
  balance?: string;
  isConnected: boolean;
  chainId?: string;
  status: string;
}
const LunoContext = createContext<LunoContextValue | null>(null);

export const LunoProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { account, address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { chain } = useChain();
  const status = useStatus();

  const value = useMemo<LunoContextValue>(() => ({
    connect: connectAsync,
    disconnect: disconnectAsync,
    address,
    balance: balanceData ? balanceData.free.toString() : undefined,
    isConnected: !!address,
    chain,   
    status,
  }), [connectAsync, disconnectAsync, address, balanceData, chain, status]);

  return <LunoContext.Provider value={value}>{children}</LunoContext.Provider>;
};

export const useLuno = () => {
  const ctx = useContext(LunoContext);
  if (!ctx) throw new Error("useLuno must be used within LunoProviderWrapper");
  return ctx;
};
