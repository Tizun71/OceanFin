import type { Address, PublicClient } from "viem";

/**
 * E-mode category ids are governance-mutable, so a workflow stores the human
 * label ("AVAX correlated") and the id is resolved on-chain right before
 * signing. Hardcoding an id risks enabling the wrong category, which changes the
 * LTV/liquidation threshold the position is priced against.
 */

/** Aave v3.2+ exposes the label directly. */
const EMODE_LABEL_ABI = [
  {
    type: "function",
    name: "getEModeCategoryLabel",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint8" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

/** Aave v3.0/3.1 returns the label inside the category struct. */
const EMODE_DATA_ABI = [
  {
    type: "function",
    name: "getEModeCategoryData",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint8" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "ltv", type: "uint16" },
          { name: "liquidationThreshold", type: "uint16" },
          { name: "liquidationBonus", type: "uint16" },
          { name: "priceSource", type: "address" },
          { name: "label", type: "string" },
        ],
      },
    ],
  },
] as const;

/** Category 0 means "no e-mode", so scanning starts at 1. */
const MAX_CATEGORY_ID = 16;

const normalise = (s: string) => s.trim().toLowerCase();

/** Every configured category on this market, keyed by id. */
export async function readEModeCategories(
  publicClient: PublicClient,
  pool: Address,
): Promise<Map<number, string>> {
  const ids = Array.from({ length: MAX_CATEGORY_ID }, (_, i) => i + 1);
  const found = new Map<number, string>();

  const byLabel = await publicClient.multicall({
    allowFailure: true,
    contracts: ids.map((id) => ({
      address: pool,
      abi: EMODE_LABEL_ABI,
      functionName: "getEModeCategoryLabel" as const,
      args: [id] as const,
    })),
  });

  byLabel.forEach((res, i) => {
    if (res.status === "success" && typeof res.result === "string" && res.result.trim()) {
      found.set(ids[i], res.result);
    }
  });

  if (found.size > 0) return found;

  // Older market: fall back to the struct getter.
  const byData = await publicClient.multicall({
    allowFailure: true,
    contracts: ids.map((id) => ({
      address: pool,
      abi: EMODE_DATA_ABI,
      functionName: "getEModeCategoryData" as const,
      args: [id] as const,
    })),
  });

  byData.forEach((res, i) => {
    const label = (res as any)?.result?.label;
    if (res.status === "success" && typeof label === "string" && label.trim()) {
      found.set(ids[i], label);
    }
  });

  return found;
}

/**
 * Resolve a category label to its current on-chain id.
 * Throws (listing what the market offers) rather than guessing — an unknown
 * label must block signing, not silently enable a different category.
 */
export async function resolveEModeCategoryId(
  publicClient: PublicClient,
  pool: Address,
  label: string,
): Promise<number> {
  const wanted = normalise(label);
  if (!wanted) throw new Error("ENABLE_E_MODE step has an empty category label");

  const categories = await readEModeCategories(publicClient, pool);

  for (const [id, name] of categories) {
    if (normalise(name) === wanted) return id;
  }

  const available = [...categories.entries()].map(([id, n]) => `${id}=${n}`).join(", ");
  throw new Error(
    `E-mode category "${label}" not found on this market. Available: ${available || "none"}`,
  );
}
