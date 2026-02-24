export class DefiStrategyVersion {
  constructor(
    public id: string,
    public strategy_id: string,
    public version: number,
    public workflow_json: object,
    public created_at: Date,
    public workflow_graph: object,
  ) {}
}
