export class DefiStrategySimulationSnapshot {
  constructor(
    public id: string,
    public strategy_version_id: string,
    public snapshot_type: string,
    public estimated_outputs: object,
    public estimated_weight: bigint,
    public estimated_fee: bigint,
    public chain_state_ref: string,
    public created_at: Date,
  ) {}
}
