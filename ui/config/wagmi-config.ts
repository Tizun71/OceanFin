import { fallback, http } from "wagmi";
import { avalanche, base, arbitrum } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// WalletConnect is in scope (production). If no projectId is configured,
// fall back to injected-only so the app still boots in dev.
const wallets = projectId
  ? [injectedWallet, metaMaskWallet, walletConnectWallet, rainbowWallet, coinbaseWallet]
  : [injectedWallet, metaMaskWallet, coinbaseWallet];

const avalancheRpc = process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL;
const baseRpc = process.env.NEXT_PUBLIC_BASE_RPC_URL;
const arbitrumRpc = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;

export const wagmiConfig = getDefaultConfig({
  appName: "OceanFin",
  // getDefaultConfig requires a projectId string; empty is tolerated when
  // WalletConnect is not in the wallet list.
  projectId: projectId || "oceanfin-dev",
  chains: [avalanche, base, arbitrum],
  wallets: [
    {
      groupName: "Recommended",
      wallets,
    },
  ],
  transports: {
    // fallback() keeps reads/simulations alive if the primary RPC rate-limits.
    [avalanche.id]: fallback([http(avalancheRpc), http()]),
    [base.id]: fallback([http(baseRpc), http()]),
    [arbitrum.id]: fallback([http(arbitrumRpc), http()]),
  },
  ssr: false,
});
