import { getNetwork, JsonRpcProvider, Network } from "@ethersproject/providers"
import { ApiPromise, WsProvider } from "@polkadot/api"

export class PolkadotEvmRpcProvider extends JsonRpcProvider {
  provider: WsProvider

  constructor(api: ApiPromise) {
    const provider = getProviderInstance(api)
    const path = provider.endpoint
    super(path)
    this.provider = provider
  }

  async _uncachedDetectNetwork(): Promise<Network> {
    const chainId = await this.send("eth_chainId", [])
    return getNetwork(parseInt(chainId, 16))
  }

  send(method: string, params: Array<any> = []): Promise<any> {
    return this.provider.send(method, params)
  }
}

export function getProviderInstance(api: ApiPromise) {
  // @ts-ignore
  const options = api?._options
  return options?.provider as WsProvider
}