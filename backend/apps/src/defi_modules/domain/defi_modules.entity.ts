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
  ) {}
}
