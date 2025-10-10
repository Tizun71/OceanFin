
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_API_URL");
}

//  Simulate strategy
export const simulateStrategy = async (strategy: any, amount: number) => {
  if (!strategy?.id) throw new Error("Invalid strategy");

  const assetIn = strategy.inputAssetId ?? 2;
  const iterations = strategy.iterations ?? 3;
  const assetIdIn = strategy.assetIdIn ?? 5;

  const url = `${API_URL}/strategies/${strategy.id}/simulate?amountIn=${amount}&assetIn=${assetIn}&iterations=${iterations}&assetIdIn=${assetIdIn}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Simulation failed: ${errorText}`);
  }

  return res.json();
};

//  Fetch all strategies
export const fetchStrategies = async () => {
  const res = await fetch(`${API_URL}/strategies`, { cache: "no-store" });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch strategies: ${errorText}`);
  }

  return res.json();
};

//  Fetch single strategy by ID
export const getStrategy = async (id: string) => {
  const res = await fetch(`${API_URL}/strategies/${id}`, { cache: "no-store" });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch strategy: ${errorText}`);
  }

  return res.json();
};
