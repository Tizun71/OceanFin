"use client";

import "@rainbow-me/rainbowkit/styles.css";
import React, { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/config/wagmi-config";

// Ocean-themed RainbowKit to match the Luno wallet UI (#00C2CB accent).
const oceanRainbowTheme = darkTheme({
  accentColor: "#00C2CB",
  accentColorForeground: "#001F2D",
  borderRadius: "medium",
  overlayBlur: "small",
});

interface EvmProviderProps {
  children: ReactNode;
}

/**
 * EVM wallet rail (wagmi + RainbowKit), mounted beside LunoProvider.
 * Shares the app-level QueryClient (do not create another one here).
 */
export function EvmProvider({ children }: EvmProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={oceanRainbowTheme} modalSize="compact">
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
