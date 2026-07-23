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
  /**
   * ERC-20 lending markets keyed by the LOWERCASED underlying token address.
   * Supply = mint(qiToken), Borrow = borrow(qiToken). Native AVAX (qiAVAX) is
   * intentionally excluded — it needs the payable path, so WAVAX is not a Benqi
   * builder market. Addresses from docs.benqi.fi/resources/contracts.
   */
  markets: Record<`0x${string}`, { qiToken: `0x${string}`; symbol: string }>;
}

/**
 * Aave V4 spoke keys. V4 replaces v3's single pool-per-market with a Liquidity
 * Hub plus isolated borrowing Spokes; each spoke has its own reserve list and
 * risk parameters, so the builder exposes one module per spoke.
 */
export type AaveV4SpokeKey = "MAIN" | "AVAX_CORRELATED" | "FOREX";

export interface AaveV4Addresses {
  /** Liquidity Hub holding the pooled assets for every spoke on this chain. */
  hub: `0x${string}`;
  /** Borrowing spokes (proxies) users transact against. */
  spokes: Record<AaveV4SpokeKey, { name: string; address: `0x${string}` }>;
}

export interface ChainProtocols {
  aaveV3?: AaveV3Addresses;
  aaveV4?: AaveV4Addresses;
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
    iconUrl: "/icons/chains/hydration.png",
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
      // Aave V4 (live on Avalanche since 2026-07-15). Addresses read from the
      // official API (api.v4.aave.com) and verified on-chain: every spoke's
      // getReserve() points at this hub. Reserve ids are NOT stored here —
      // they are per-spoke indexes resolved on-chain in lib/evm/aave-v4.ts.
      aaveV4: {
        hub: "0xd07369fAE4A5BB13c9Ce446B052c7867B1AbDf6e",
        spokes: {
          MAIN: { name: "Main", address: "0x435272CefF93a1E657E8ABfdf0A13e95900A3a56" },
          AVAX_CORRELATED: {
            name: "AVAX Correlated",
            address: "0x3b517594277c67307CF2d7CBE6FE1D4399B68c41",
          },
          FOREX: { name: "Forex", address: "0x6a37776B5E026dBdF043b4F933c323C84DD1B514" },
        },
      },
      traderJoe: TRADER_JOE_V2_2,
      // Benqi (Avalanche only). Verified from docs.benqi.fi.
      benqi: {
        comptroller: "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4",
        sAvax: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE",
        qiAvax: "0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c",
        qiSAvax: "0xF362feA9659cf036792c9cb02f8ff8198E21B4cB",
        // ERC-20 markets: underlying (lowercased) -> qiToken. Underlying
        // addresses match seeds/0001-defi-token.sql (Aave Avalanche reserves).
        markets: {
          "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be": { qiToken: "0xF362feA9659cf036792c9cb02f8ff8198E21B4cB", symbol: "sAVAX" },
          "0x152b9d0fdc40c096757f570a51e494bd4b943e50": { qiToken: "0x89a415b3D20098E6A6C8f7a59001C67BD3129821", symbol: "BTC.b" },
          "0x50b7545627a5162f82a992c33b87adc75187b218": { qiToken: "0xe194c4c5aC32a3C9ffDb358d9Bfd523a0B6d1568", symbol: "WBTC.e" },
          "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab": { qiToken: "0x334AD834Cd4481BB02d09615E7c11a00579A7909", symbol: "WETH.e" },
          "0x5947bb275c521040051d82396192181b413227a3": { qiToken: "0x4e9f683A27a6BdAD3FC2764003759277e93696e6", symbol: "LINK.e" },
          "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7": { qiToken: "0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF", symbol: "USDT" },
          "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e": { qiToken: "0xB715808a78F6041E46d61Cb123C9B4A27056AE9C", symbol: "USDC" },
          "0xd586e7f844cea2f87f50152665bcbc2c279d8d70": { qiToken: "0x835866d37AFB8CB8F8334dCCdaf66cf01832Ff5D", symbol: "DAI.e" },
        },
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
    iconUrl: "/icons/chains/base.png",
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
    iconUrl: "/icons/chains/arbitrum.png",
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
