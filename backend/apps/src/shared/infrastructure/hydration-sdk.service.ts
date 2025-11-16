import { BalanceClient } from '@galacticcouncil/sdk';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { H160, createSdkContext } from '@galacticcouncil/sdk';
import { ethers } from 'ethers';
const DEFAULT_RPC_ENDPOINT = 'wss://rpc.hydradx.cloud';

@Injectable()
export class HydrationSdkService implements OnModuleDestroy {
  private api: ApiPromise | null = null;
  private sdkContext: any | null = null;
  private connecting = false;
  private pendingInit: Promise<ApiPromise> | null = null;

  async onModuleDestroy() {
    if (this.api) {
      try {
        await this.api.disconnect();
      } catch { }
      this.api = null;
      this.sdkContext = null;
    }
  }

  async getApi(): Promise<ApiPromise> {
    if (this.api) return this.api;
    if (this.pendingInit) return this.pendingInit;
    this.connecting = true;
    this.pendingInit = (async () => {
      const endpoint = process.env.HYDRATION_RPC_ENDPOINT || DEFAULT_RPC_ENDPOINT;
      const provider = new WsProvider(endpoint);
      const api = await ApiPromise.create({ provider });
      await api.isReady;
      this.api = api;
      return api;
    })().finally(() => {
      this.connecting = false;
      this.pendingInit = null;
    });
    return this.pendingInit;
  }

  async getSdkContext(): Promise<any> {
    if (this.sdkContext) return this.sdkContext;
    const api = await this.getApi();
    this.sdkContext = await createSdkContext(api);
    return this.sdkContext;
  }

  async getApiAndSdk(): Promise<{ api: ApiPromise; sdk: any }> {
    const api = await this.getApi();
    const sdk = await this.getSdkContext();
    return { api, sdk };
  }

  async checkEvmBinding(substrateAddress: string): Promise<{ isBound: boolean; evmAddress: string }> {
    if (!substrateAddress) throw new Error('substrateAddress is required');
    const api = await this.getApi();
    const evmAddress = H160.fromAny(substrateAddress).toString();
    const extension = await api.query.evmAccounts.accountExtension(evmAddress);
    const human = extension.toHuman();
    const isBound = human != null && human !== '';
    return { isBound, evmAddress };
  }

  async getTokenBalance(account: string, tokenId: string): Promise<number> {
     const api = await this.getApi();
    const balanceClient = new BalanceClient(api);
    const res = await balanceClient.getTokenBalanceData(account.toString(), tokenId.toString());

    const freeValue = res.get('free');
    const free = freeValue !== undefined ? BigInt(freeValue.toString()) : BigInt(0);
    const freeHuman = ethers.utils.formatUnits(free.toString(), 10); // DOT
    return Number(Number(freeHuman).toFixed(3));
  }
}
