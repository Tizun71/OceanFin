export const ALLOWED_NEXT_ACTIONS: Record<string, string[]> = {
  "JOIN STRATEGY": ["JOIN STRATEGY", "SWAP"],
  SWAP: ["JOIN STRATEGY", "SWAP"],
  SUPPLY: ["BORROW"],
  BORROW: [],
};

export const ALLOWED_FIRST_ACTIONS = ["JOIN STRATEGY", "SWAP", "SUPPLY"];

export const canBeFirstStep = (operationType?: string) => {
  if (!operationType) {
    return {
      valid: false,
      message: "Invalid action type.",
    };
  }

  const valid = ALLOWED_FIRST_ACTIONS.includes(operationType);

  return {
    valid,
    message: valid
      ? ""
      : "This action cannot be the first step. Borrow must come after Supply.",
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

  const allowedTargets = ALLOWED_NEXT_ACTIONS[sourceType] || [];
  const valid = allowedTargets.includes(targetType);

  if (valid) {
    return {
      valid: true,
      message: "",
    };
  }

  return {
    valid: false,
    message: `Invalid connection: ${sourceType} cannot connect to ${targetType}.`,
  };
};