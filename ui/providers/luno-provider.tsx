"use client";

import { ReactNode } from "react";
import { LunoKitProvider } from "@luno-kit/ui";
import { lunoConfig } from "@/config/luno-config";

const themeOverrides = {
  colors: {
    accentColor: "#4ade80",
    connectButtonBackground: "#1f2937",
    connectButtonText: "#fff",
  },
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LunoKitProvider config={lunoConfig} theme={themeOverrides}>
      {children}
    </LunoKitProvider>
  );
}
