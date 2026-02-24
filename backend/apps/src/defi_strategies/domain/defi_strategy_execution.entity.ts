export class DefiStrategyExecution {
  constructor(
    public id: string,
    public strategy_version_id: string,
    public extrinsic_hash: string,
    public execution_status: string,
    public executed_at: Date,
  ) {}
}
