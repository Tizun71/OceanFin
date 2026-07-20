import {
  ALL_CHAINS,
  CHAIN_SUPPORTED_NODES,
  ChainMeta,
  ChainSlug,
  getChainBySlug,
} from "@/config/chains/chain-registry";

/** Human-readable protocol names available per chain (from registry). */
function protocolsForChain(chain: ChainMeta): string[] {
  const names: string[] = [];
  if (chain.protocols.aaveV3) names.push("Aave v3");
  if (chain.protocols.traderJoe) names.push("Trader Joe (LFJ)");
  if (chain.protocols.benqi) names.push("Benqi (sAVAX looping)");
  return names;
}

/**
 * Build a compact capability summary for the AI system context so Gemini never
 * proposes an op a chain can't do (e.g. SWAP on Base). Deterministic — pairs
 * with post-generation validation. Kept terse (no ABIs) to limit token cost.
 */
export function buildChainCapabilityContext(activeSlug: ChainSlug): string {
  const active = getChainBySlug(activeSlug);
  const evmChains = ALL_CHAINS.filter((c) => c.kind === "evm");

  const lines: string[] = [];
  lines.push(`ACTIVE_CHAIN: ${active.name} (${active.slug}).`);

  if (active.kind === "evm") {
    lines.push(
      "CHAIN_CAPABILITY_MATRIX (only propose operations a chain supports):",
    );
    for (const c of evmChains) {
      const nodes = CHAIN_SUPPORTED_NODES[c.slug].join(", ");
      const protos = protocolsForChain(c).join(", ") || "none";
      lines.push(`- ${c.slug} (chainId ${c.chainId}): ops=[${nodes}]; protocols=[${protos}]`);
    }
    lines.push(
      "RULES: EVM only. Use BRIDGE (LI.FI) to move assets between EVM chains before an op on another chain. Never propose an op not in that chain's ops list. Every generated step must include a `chain` field.",
    );
  } else {
    // Polkadot path — keep existing single-chain behaviour, no EVM matrix.
    lines.push("Polkadot (Hydration) strategy — substrate ops only.");
  }

  return lines.join("\n");
}

/** Prefix a user's additionalContext with the capability matrix. */
export function withChainCapability(
  activeSlug: ChainSlug,
  additionalContext?: string,
): string {
  const capability = buildChainCapabilityContext(activeSlug);
  return additionalContext ? `${capability}\n\n${additionalContext}` : capability;
}
