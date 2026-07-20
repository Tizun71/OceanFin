/**
 * Which step can follow which in the strategy builder.
 *
 * Scoped to the operations Avalanche actually exposes today: Aave v3
 * SUPPLY/BORROW and Trader Joe SWAP. JOIN_STRATEGY is intentionally absent —
 * no protocol module provides it on Avalanche (Benqi looping is not wired up),
 * so allowing it would let users build a strategy that cannot execute.
 */
export const ALLOWED_NEXT_ACTIONS: Record<string, string[]> = {
  // Swap the proceeds again, or put them to work as collateral.
  SWAP: ["SWAP", "SUPPLY"],
  // Collateral must exist before anything can be borrowed against it.
  SUPPLY: ["BORROW"],
  // Borrowed funds can be swapped or re-supplied — this is the leverage loop.
  BORROW: ["SWAP", "SUPPLY"],
};

/**
 * BORROW is excluded: Aave rejects a borrow with no collateral behind it, so a
 * strategy starting there always fails on-chain.
 */
export const ALLOWED_FIRST_ACTIONS = ["SWAP", "SUPPLY"];

export const canBeFirstStep = (operationType?: string) => {
  if (!operationType) {
    return {
      valid: false,
      message: "Invalid action type.",
    };
  }

  const normalizedType = operationType.toUpperCase();
  const valid = ALLOWED_FIRST_ACTIONS.includes(normalizedType);

  return {
    valid,
    message: valid
      ? ""
      : `${normalizedType} cannot be the first step. Please start with ${ALLOWED_FIRST_ACTIONS.join(" or ")}.`,
  };
};

export const validateConnection = (
  sourceType?: string,
  targetType?: string
) => {
  if (!sourceType || !targetType) {
    return {
      valid: false,
      message: "Invalid connection.",
    };
  }

  const normalizedSource = sourceType.toUpperCase();
  const normalizedTarget = targetType.toUpperCase();

  const allowedTargets = ALLOWED_NEXT_ACTIONS[normalizedSource] || [];
  const valid = allowedTargets.includes(normalizedTarget);

  if (valid) {
    return {
      valid: true,
      message: "",
    };
  }

  return {
    valid: false,
    message: `Invalid connection: ${normalizedSource} cannot connect to ${normalizedTarget}.`,
  };
};
