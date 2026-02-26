export class DefiPair {
  constructor(
    public id: string,
    public action_id: string,
    public token_in_id?: string,
    public token_out_id?: string,
  ) {}
}
