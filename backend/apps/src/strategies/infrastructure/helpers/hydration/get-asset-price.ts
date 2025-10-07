import { initializeHydrationSDK } from './utils/initialize-hydration-sdk';

export async function getAssetPrice(assetInId: string, assetOutId: string) {
  const { sdk } = await initializeHydrationSDK();
  const data = await sdk.api.router.getBestSpotPrice(assetInId, assetOutId);
  sdk.destroy();

  if (!data || !data.amount || data.decimals === undefined) {
    throw new Error(
      `Failed to get asset price for ${assetInId} to ${assetOutId}`,
    );
  }

  const raw = data.amount.toString();

  return Number(raw) / 10 ** data.decimals;
}
