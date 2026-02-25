import { CreateStrategyPayload } from "@/types/defi";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const getDefiModules = async () => {
  const res = await fetch(`${BASE_URL}/defi-modules`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch defi modules");
  }

  return res.json();
};

export const createDefiModule = async (data: any) => {
  const res = await fetch(`${BASE_URL}/defi-modules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create defi module");
  }

  return res.json();
};

export const createStrategy = async (payload: CreateStrategyPayload) => {
  const res = await fetch(`${BASE_URL}/strategies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      module_id: payload.moduleId,
      action_id: payload.actionId,
      token_in_id: payload.tokenInId,
      token_out_id: payload.tokenOutId,
      amount_in: payload.amount,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
};

export const estimateSwap = async (data: {
  token_in_id: string;
  token_out_id: string;
  amount_in: number;
}) => {
  const res = await fetch(`${BASE_URL}/defi-modules/pairs/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      operation_type: "SWAP",
      ...data,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to estimate swap");
  }

  return res.json();
};

export const createStrategyWorkflow = async (
  workflow_json: any,
  workflow_graph: any = {},
) => {
  const res = await fetch(`${BASE_URL}/defi-strategies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      owner_id: "f705f5d2-59f6-4433-8c6d-ed0ebe565d4b",
      name: "My Strategy",
      description: "Created from Builder",
      is_public: true,
      chain_context: "hydration",
      status: "draft",
      workflow_json,
      workflow_graph,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    throw new Error(error);
  }
  return res.json();
};
