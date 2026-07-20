import { Action } from "@/types/defi";
import { canBeFirstStep, validateConnection } from "@/lib/defi-connection-rules";
import { resolveDefiOperationType } from "@/app/builder/components/nodes/defi-node-utils";

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
  // defi_module_actions has no operation_type column — derive the type from the
  // action name instead, or every action is rejected as "Invalid action type".
  const newOperationType = resolveDefiOperationType({ action } as any);

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
    const lastOperationType = resolveDefiOperationType(lastNode?.data);

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