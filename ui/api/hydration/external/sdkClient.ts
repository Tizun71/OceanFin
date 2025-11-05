// sdkClient.ts
import { createSdkContext } from '@galacticcouncil/sdk';
import { ApiPromise, WsProvider } from '@polkadot/api';

const HYDRATION_RPC_ENDPOINT = 'wss://rpc.hydradx.cloud';

let apiInstance: ApiPromise | null = null;
let sdkInstance: any | null = null;
let creatingPromise: Promise<{ api: ApiPromise; sdk: any }> | null = null;

async function createCtx() {
  const provider = new WsProvider(HYDRATION_RPC_ENDPOINT);
  const api = await ApiPromise.create({ provider });
  await api.isReady;
  const sdk = await createSdkContext(api);

  api.on('disconnected', () => {
    apiInstance = null;
    sdkInstance = null;
    creatingPromise = null;
  });

  apiInstance = api;
  sdkInstance = sdk;
  return { api, sdk };
}

export async function getHydrationSDK() {
  if (apiInstance && apiInstance.isConnected) {
    return { api: apiInstance, sdk: sdkInstance! };
  }
  if (creatingPromise) {
    return creatingPromise;
  }
  creatingPromise = createCtx();
  try {
    return await creatingPromise;
  } finally {
    // leave creatingPromise set until disconnected or explicit disconnect
  }
}

export async function disconnectHydrationSDK() {
  try {
    if (apiInstance) {
      await apiInstance.disconnect();
    }
  } finally {
    apiInstance = null;
    sdkInstance = null;
    creatingPromise = null;
  }
}
