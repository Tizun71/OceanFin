import { createStrategyWorkflow } from "@/services/defi-module-service";

export const submitStrategy = async ({
  userId,
  name,
  workflowJson,
  chainContext,
}: {
  userId: string;
  name: string;
  workflowJson: any;
  chainContext: string;
}) => {
  const payload = {
    owner_id: userId,
    name,
    description: "Strategy description",
    is_public: true,
    chain_context: chainContext,
    status: "draft",
    workflow_json: workflowJson,
    workflow_graph: workflowJson,
  };

  return createStrategyWorkflow(payload);
};