import {
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3Arbitrum,
} from "@bgd-labs/aave-address-book";

/**
 * Single source of truth for every chain OceanFin supports.
 * Polkadot stays on the Substrate/Luno rail; EVM chains use the wagmi/viem rail.
 * Protocol contract addresses come from audited sources (@bgd-labs/aave-address-book
 * for Aave); Trader Joe / Benqi are filled in their respective phases.
 */

export type ChainKind = "substrate" | "evm";

export type ChainSlug = "polkadot" | "avalanche" | "base" | "arbitrum";

export interface AaveV3Addresses {
  poolAddressesProvider: `0x${string}`;
  pool: `0x${string}`;
  uiPoolDataProvider: `0x${string}`;
}

export interface BenqiAddresses {
  comptroller: `0x${string}`;
  /** Liquid staking token (StakedAvax). */
  sAvax: `0x${string}`;
  /** Compound-fork qiToken markets. qiAVAX is the native market (payable mint). */
  qiAvax: `0x${string}`;
  qiSAvax: `0x${string}`;
}

export interface ChainProtocols {
  aaveV3?: AaveV3Addresses;
  traderJoe?: { lbRouter: `0x${string}`; lbQuoter: `0x${string}` };
  benqi?: BenqiAddresses;
}

// LFJ (Trader Joe) Liquidity Book v2.2 — deterministic addresses, identical on
// Avalanche + Arbitrum. Verified from developers.lfj.gg deployment addresses.
const TRADER_JOE_V2_2 = {
  lbRouter: "0x18556DA13313f3532c54711497A8FedAC273220E" as `0x${string}`,
  lbQuoter: "0x9A550a522BBaDFB69019b0432800Ed17855A51C3" as `0x${string}`,
};

export interface ChainMeta {
  slug: ChainSlug;
  kind: ChainKind;
  /** EVM only: 43114 / 8453 / 42161 */
  chainId?: number;
  name: string;
  nativeCurrency: { symbol: string; decimals: number };
  rpcUrl: string;
  explorerUrl: string;
  iconUrl: string;
  protocols: ChainProtocols;
}

const aaveAddresses = (a: {
  POOL: string;
  POOL_ADDRESSES_PROVIDER: string;
  UI_POOL_DATA_PROVIDER: string;
}): AaveV3Addresses => ({
  pool: a.POOL as `0x${string}`,
  poolAddressesProvider: a.POOL_ADDRESSES_PROVIDER as `0x${string}`,
  uiPoolDataProvider: a.UI_POOL_DATA_PROVIDER as `0x${string}`,
});

// Public RPC fallbacks; production should set NEXT_PUBLIC_*_RPC_URL to a paid provider.
const AVALANCHE_RPC =
  process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc";
const BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";
const ARBITRUM_RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";

export const CHAIN_REGISTRY: Record<ChainSlug, ChainMeta> = {
  polkadot: {
    slug: "polkadot",
    kind: "substrate",
    name: "Polkadot (Hydration)",
    nativeCurrency: { symbol: "HDX", decimals: 12 },
    rpcUrl: "wss://rpc.hydradx.cloud",
    explorerUrl: "https://hydration.subscan.io",
    iconUrl: "/chain-icon/hydration.png",
    protocols: {},
  },
  avalanche: {
    slug: "avalanche",
    kind: "evm",
    chainId: 43114,
    name: "Avalanche",
    nativeCurrency: { symbol: "AVAX", decimals: 18 },
    rpcUrl: AVALANCHE_RPC,
    explorerUrl: "https://snowtrace.io",
    iconUrl: "/icons/chains/avax.png",
    protocols: {
      aaveV3: aaveAddresses(AaveV3Avalanche),
      traderJoe: TRADER_JOE_V2_2,
      // Benqi (Avalanche only). Verified from docs.benqi.fi.
      benqi: {
        comptroller: "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4",
        sAvax: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE",
        qiAvax: "0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c",
        qiSAvax: "0xF362feA9659cf036792c9cb02f8ff8198E21B4cB",
      },
    },
  },
  base: {
    slug: "base",
    kind: "evm",
    chainId: 8453,
    name: "Base",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    rpcUrl: BASE_RPC,
    explorerUrl: "https://basescan.org",
    iconUrl: "/chain-icon/base.png",
    protocols: {
      aaveV3: aaveAddresses(AaveV3Base),
    },
  },
  arbitrum: {
    slug: "arbitrum",
    kind: "evm",
    chainId: 42161,
    name: "Arbitrum",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    rpcUrl: ARBITRUM_RPC,
    explorerUrl: "https://arbiscan.io",
    iconUrl: "/chain-icon/arbitrum.png",
    protocols: {
      aaveV3: aaveAddresses(AaveV3Arbitrum),
      traderJoe: TRADER_JOE_V2_2,
    },
  },
};

export const ALL_CHAINS: ChainMeta[] = Object.values(CHAIN_REGISTRY);

/**
 * Temporary kill-switch for the Polkadot/Hydration rail. Registry entries and
 * the hydration API layer stay intact; only chains the UI offers are filtered.
 * Flip back to true to re-enable.
 */
export const POLKADOT_ENABLED = false;

/** Chains the UI is allowed to offer (chain selector, wallet rail, palette). */
export const SELECTABLE_CHAINS: ChainMeta[] = POLKADOT_ENABLED
  ? ALL_CHAINS
  : ALL_CHAINS.filter((c) => c.kind !== "substrate");

/** Default active chain — first selectable chain. */
export const DEFAULT_CHAIN_SLUG: ChainSlug = SELECTABLE_CHAINS[0].slug;

export const getChainBySlug = (slug: ChainSlug): ChainMeta => CHAIN_REGISTRY[slug];

export const getEvmChains = (): ChainMeta[] =>
  ALL_CHAINS.filter((c) => c.kind === "evm");

export const getChainByEvmId = (chainId: number): ChainMeta | undefined =>
  ALL_CHAINS.find((c) => c.kind === "evm" && c.chainId === chainId);

export const EVM_CHAIN_IDS = getEvmChains().map((c) => c.chainId as number);

/**
 * Node/operation types each chain supports in the builder palette.
 * EVM starts with Aave SUPPLY/BORROW (P2); SWAP (P3), JOIN_STRATEGY (P4),
 * BRIDGE (P5) are added as their phases land. Backend module filtering is the
 * primary driver; this map is a capability guard for palette/validation.
 */
export const CHAIN_SUPPORTED_NODES: Record<ChainSlug, string[]> = {
  polkadot: ["SWAP", "SUPPLY", "BORROW", "JOIN_STRATEGY", "ENABLE_E_MODE"],
  // BRIDGE (LI.FI) available on every EVM chain. Avalanche also has Benqi looping.
  avalanche: ["SUPPLY", "BORROW", "SWAP", "JOIN_STRATEGY", "BRIDGE"],
  base: ["SUPPLY", "BORROW", "BRIDGE"],
  arbitrum: ["SUPPLY", "BORROW", "SWAP", "BRIDGE"],
};
