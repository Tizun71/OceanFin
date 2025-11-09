import { getHydrationSDK } from "./external/sdkClient";

export async function getGasPrice(): Promise<number> {
    const { api } = await getHydrationSDK();
    const gasPrice = await api.rpc.eth.gasPrice();
    const gas = gasPrice.toString();
    
    return Number(gas);
}