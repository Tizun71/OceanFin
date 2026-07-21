import type { Edge } from "reactflow";
import { resolveDefiOperationType } from "@/app/builder/components/nodes/defi-node-utils";

/**
 * Operation types where the user must pick an output token, so the config
 * panel always has something to collect. SUPPLY has no output token.
 */
const NEEDS_TOKEN_OUT = new Set(["SWAP", "BORROW", "JOIN_STRATEGY"]);

/**
 * A step needs the config panel only when the user has something to enter:
 * the first step (chooses input token + amount), or any step that must pick an
 * output token. A chained SUPPLY inherits its input and amount from the
 * previous step and has no output — nothing to enter, so it is auto-configured.
 */
export function nodeRequiresInput(
  node: { id: string; data?: any },
  edges: Edge[],
): boolean {
  const isFirst = !edges.some((e) => e.target === node.id);
  if (isFirst) return true;

  const type = resolveDefiOperationType(node?.data);
  // Unknown type -> keep the panel available rather than trap the user.
  return type ? NEEDS_TOKEN_OUT.has(type) : true;
}
