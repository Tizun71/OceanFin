import { getHydrationSDK } from "./external/sdkClient";

export async function getGasPrice(): Promise<bigint> {
  const { api } = await getHydrationSDK();

  const gasPriceBN = await api.rpc.eth.gasPrice();
  const gasPrice = BigInt(gasPriceBN.toString());

  // Buffer 20%
  const adjustedGas = gasPrice * BigInt(12) / BigInt(10);
  return adjustedGas;
}