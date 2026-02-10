export class DefiWorkflowEdge {
  constructor(
    public id: string,
    public strategy_version_id: string,
    public from_node_id: string | null,
    public to_node_id: string | null,
  ) {}
}
