import { createSdkContext } from '@galacticcouncil/sdk';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/api';

const HYDRATION_RPC_ENDPOINT = 'wss://rpc.hydradx.cloud';

export const initializeHydrationSDK = async () => {
  try {
    const provider = new WsProvider(HYDRATION_RPC_ENDPOINT);
    const api = await ApiPromise.create({ provider });

    await api.isReady;

    const sdk = await createSdkContext(api);
    return { api, sdk };
  } catch (error) {
    console.error('❌ Failed to initialize Hydration SDK:', error);
    throw new Error('SDK initialization failed');
  }
};
