import type { NodeVariant } from "../node-types";

export function getNodeVariant(action?: {
  key?: string;
  name?: string;
  type?: string;
}): NodeVariant {
  const key = action?.key?.toLowerCase?.() || "";
  const name = action?.name?.toLowerCase?.() || "";
  const type = action?.type?.toLowerCase?.() || "";

  const value = key || type || name;

  if (value.includes("join_strategy") || value.includes("join strategy")) {
    return "join_strategy";
  }

  if (value.includes("swap")) {
    return "swap";
  }

  if (value.includes("supply")) {
    return "supply";
  }

  if (value.includes("borrow")) {
    return "borrow";
  }

  return "default";
}