export class DefiModuleAction {
  constructor(
    public readonly id: string,
    public module_id: string,
    public name: string,
    public pallet: string,
    public call: string,
    public description: string,
    public param_schema: object,
    public risk_level: string,
    public is_active: boolean,
    public readonly created_at: Date,
  ) {}
}
