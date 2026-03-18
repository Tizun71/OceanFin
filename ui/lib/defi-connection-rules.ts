export const ALLOWED_NEXT_ACTIONS: Record<string, string[]> = {
  SWAP: ["SUPPLY", "SWAP", "JOIN_STRATEGY"],
  JOIN_STRATEGY: ["SWAP", "BORROW"],
  SUPPLY: ["BORROW"],
  BORROW: ["SWAP", "JOIN_STRATEGY", "SUPPLY"],
};

export const ALLOWED_FIRST_ACTIONS = ["SWAP", "JOIN_STRATEGY", "SUPPLY"];

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
      : "BORROW cannot be the first step. Please start with SWAP, JOIN_STRATEGY, or SUPPLY.",
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