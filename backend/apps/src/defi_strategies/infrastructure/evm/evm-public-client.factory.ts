import { createPublicClient, fallback, http, PublicClient } from 'viem';
import { avalanche, base, arbitrum } from 'viem/chains';

/**
 * Read-only viem public clients per EVM chain, memoized. Server-side reads only
 * (simulation display) — NO signing keys ever live here. RPC comes from env with
 * a public fallback so a single provider outage doesn't break simulation.
 */
const CHAINS = {
  43114: { chain: avalanche, rpcEnv: process.env.AVALANCHE_RPC_URL },
  8453: { chain: base, rpcEnv: process.env.BASE_RPC_URL },
  42161: { chain: arbitrum, rpcEnv: process.env.ARBITRUM_RPC_URL },
} as const;

const cache = new Map<number, PublicClient>();

export function getEvmPublicClient(chainId: number): PublicClient {
  const cached = cache.get(chainId);
  if (cached) return cached;

  const entry = CHAINS[chainId as keyof typeof CHAINS];
  if (!entry) throw new Error(`Unsupported EVM chainId: ${chainId}`);

  const client = createPublicClient({
    chain: entry.chain,
    transport: fallback(
      [http(entry.rpcEnv), http()],
      { retryCount: 3, retryDelay: 300 },
    ),
  }) as PublicClient;

  cache.set(chainId, client);
  return client;
}
