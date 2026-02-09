export class DefiStrategyVersion {
  constructor(
    public id: string,
    public strategy_id: string,
    public version: number,
    public workflow_json: object,
    public workflow_hash: string,
    public created_at: Date,
  ) {}
}
