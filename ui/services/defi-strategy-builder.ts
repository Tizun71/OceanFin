import { createStrategyWorkflow } from "@/services/defi-module-service";

export const submitStrategy = async ({
  userId,
  name,
  workflowJson,
}: {
  userId: string;
  name: string;
  workflowJson: any;
}) => {
  const payload = {
    owner_id: userId,
    name,
    description: "Strategy description",
    is_public: true,
    chain_context: "Hydration",
    status: "draft",
    workflow_json: workflowJson,
    workflow_graph: workflowJson,
  };

  return createStrategyWorkflow(payload);
};