export class DefiActionRequired {
  constructor(
    public readonly id: string,
    public action_id: string,
    public module_id: string,
    public action_required_id: string,
  ) {}
}
