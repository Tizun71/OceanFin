export class DefiExecutionStepResult {
  constructor(
    public id: string,
    public execution_id: string,
    public step_index: number,
    public parachain_id: number,
    public pallet: string,
    public call: string,
    public status: string,
    public output_assets: object,
    public error_message: string | null,
  ) {}
}
