export class DefiToken {
  constructor(
    public readonly id: string,
    public readonly name: string,
    // Hydration asset id. Null for EVM tokens, which are keyed by address.
    public readonly asset_id: number | null,
    // Chain the token lives on. Substrate tokens keep 'polkadot' (default);
    // EVM tokens use the chain slug ('avalanche' | 'base' | 'arbitrum').
    public readonly chain: string = 'polkadot',
    // EVM numeric chain id (43114 / 8453 / 42161); null for substrate.
    public readonly chain_id: number | null = null,
    // ERC-20 contract address, lowercase. Null for substrate tokens, which are
    // identified by asset_id on Hydration instead. Required for EVM execution —
    // see build-evm-plan.ts, which cannot encode an amount without it.
    public readonly address: string | null = null,
    // ERC-20 decimals (USDC 6, WETH 18, ...); null for substrate.
    public readonly decimals: number | null = null,
  ) {}

  /** True when this token carries everything an EVM step needs to execute. */
  public isExecutableOnEvm(): boolean {
    return this.chain !== 'polkadot' && !!this.address && this.decimals !== null;
  }
}
