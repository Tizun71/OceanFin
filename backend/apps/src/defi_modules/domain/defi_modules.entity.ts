export class DefiModule {
  constructor(
    public readonly id: string,
    public name: string,
    public protocol: string,
    public category: string,
    public parachain_id: number,
    public icon_url: string,
    public description: string,
    public website_url: string,
    public is_active: boolean,
    public readonly created_at: Date,
    // Chain slug: 'polkadot' (default) | 'avalanche' | 'base' | 'arbitrum'.
    // parachain_id stays for substrate; EVM modules set chain + chain_id instead.
    public chain: string = 'polkadot',
    // EVM numeric chain id (43114 / 8453 / 42161); null for substrate.
    public chain_id: number | null = null,
  ) {}
}
