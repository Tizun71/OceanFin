import { Action } from "@/types/defi";
import { canBeFirstStep, validateConnection } from "@/lib/defi-connection-rules";

export const isNodeConfigured = (node: any) => {
  const config = node?.data?.config;

  return (
    config?.tokenInId &&
    config?.tokenOutId &&
    config?.amount &&
    config?.amountOut
  );
};

export const validateAddNode = ({
  nodes,
  selectedNode,
  action,
}: {
  nodes: any[];
  selectedNode: any;
  action: Action;
}) => {
  const lastNode = nodes[nodes.length - 1];
  const newOperationType = action?.operation_type;

  if (!lastNode) {
    const firstStepResult = canBeFirstStep(newOperationType);

    if (!firstStepResult.valid) {
      return firstStepResult;
    }
  }

  if (
    lastNode &&
    !isNodeConfigured(lastNode) &&
    selectedNode?.id !== lastNode.id
  ) {
    return {
      valid: false,
      message: "Please configure and save the current step before adding another node.",
    };
  }

  if (lastNode) {
    const lastOperationType = lastNode?.data?.action?.operation_type;

    const connectionResult = validateConnection(
      lastOperationType,
      newOperationType
    );

    if (!connectionResult.valid) {
      return connectionResult;
    }
  }

  return {
    valid: true,
    message: "",
  };
};