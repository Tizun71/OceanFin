export class DefiStrategySimulationSnapshot {
  constructor(
    public id: string,
    public strategy_version_id: string,
    public snapshot_type: string,
    public estimated_outputs: object,
    public estimated_weight: BigInt,
    public estimated_fee: BigInt,
    public chain_state_ref: string,
    public created_at: Date,
  ) {}
}
