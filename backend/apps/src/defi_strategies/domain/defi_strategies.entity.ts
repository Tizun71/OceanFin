export class DefiStrategy {
  constructor(
    public id: string,
    public owner_id: string,
    public name: string,
    public description: string,
    public status: string,
    public is_public: boolean,
    public chain_context: string,
    public current_version_id: string,
    public created_at: Date,
  ) {}
}
