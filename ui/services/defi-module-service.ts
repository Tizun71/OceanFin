import { CreateStrategyPayload } from "@/types/defi";
import { DefiStrategy } from "@/types/defi.strategy";

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

export const createStrategyWorkflow = async (payload: any) => {


  const res = await fetch(`${BASE_URL}/defi-strategies`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(payload),

  });

  const data = await res.json();

  if (!res.ok) {

    console.error("CREATE ERROR:", data);

    throw new Error(JSON.stringify(data));

  }

  return data;

};

export const getStrategies = async (): Promise<DefiStrategy[]> => {
  const res = await fetch(`${BASE_URL}/defi-strategies`)

  if (!res.ok) {
    throw new Error("Failed to fetch strategies")
  }

  return res.json()
}

export const getStrategiesByOwner = async (ownerId: string) => {
  const res = await fetch(
    `${BASE_URL}/defi-strategies?owner=${ownerId}`
  );

  if (!res.ok) throw new Error("Failed to fetch strategies");

  return res.json();
};

export const simulateStrategy = async (
  strategyId: string,
  amount: number
) => {
  const res = await fetch(
    `${BASE_URL}/defi-strategies/${strategyId}/simulate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        amount_in: amount,
        slippage_tolerance: 0.5,
        gas_price: 10,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Simulation failed");
  }

  return res.json();
};

export const deleteStrategy = async (id: string) => {
  const res = await fetch(`${BASE_URL}/defi-strategies/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Delete failed");
  }

  return true;
};