import { randomUUID } from "crypto";

export class Strategy {
  constructor(
    public readonly id: string = randomUUID(),
    public strategistName: string,
    public apy: number,
    public tags: string[] = [],
    public strategistHandle?: string,
    public assets: string[] = [],
    public agents: string[] = [],
    public chains: string[] = [],
  ) {}

  update(
    fields: Partial<{
      strategistName: string;
      apy: number;
      tags: string[];
      strategistHandle?: string;
      assets: string[];
      agents: string[];
      chains: string[];
    }>,
  ): void {
    if (fields.strategistName !== undefined) this.strategistName = fields.strategistName;
    if (fields.apy !== undefined) this.apy = fields.apy;
    if (fields.tags !== undefined) this.tags = fields.tags;
    if (fields.strategistHandle !== undefined) this.strategistHandle = fields.strategistHandle;
    if (fields.assets !== undefined) this.assets = fields.assets;
    if (fields.agents !== undefined) this.agents = fields.agents;
    if (fields.chains !== undefined) this.chains = fields.chains;
  }
}
