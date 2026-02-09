export class DefiStrategyWorkflowNode {
  constructor(
    public id: string,
    public strategy_version_id: string,
    public module_action_id: string,
    public node_index: number,
    public ui_position: object,
    public params: object,
    public created_at: Date,
  ) {}
}
