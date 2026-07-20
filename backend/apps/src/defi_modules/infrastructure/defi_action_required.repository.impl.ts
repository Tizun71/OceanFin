import { Injectable } from "@nestjs/common";
import { DefiActionRequired } from "../domain/defi_action_required.entity";
import { DefiActionRequiredRepository } from "../domain/defi_action_required.repository";
import { PostgresService } from "../../shared/infrastructure/postgres.service";
import { DefiModuleAction } from "../domain/defi_module_actions.entity";
import { NESTED_MODULE_SELECT } from "./defi_modules.repository.impl";

@Injectable()
export class DefiActionRequiredRepositoryImplement implements DefiActionRequiredRepository {
  constructor(private readonly db: PostgresService) {}

  private toEntity(r: any): DefiActionRequired {
    return new DefiActionRequired(r.id, r.action_id, r.module_id, r.action_required_id);
  }

  async save(defiActionRequired: DefiActionRequired): Promise<DefiActionRequired> {
    const row = await this.db.queryOne(
      `INSERT INTO defi_action_required (id, action_id, module_id, action_required_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         action_id = EXCLUDED.action_id,
         module_id = EXCLUDED.module_id,
         action_required_id = EXCLUDED.action_required_id
       RETURNING *`,
      [
        defiActionRequired.id,
        defiActionRequired.action_id,
        defiActionRequired.module_id,
        defiActionRequired.action_required_id,
      ],
    );
    return this.toEntity(row);
  }

  async findByActionId(actionId: string): Promise<DefiActionRequired[]> {
    const rows = await this.db.query(
      "SELECT * FROM defi_action_required WHERE action_id = $1",
      [actionId],
    );
    return rows.map((r) => this.toEntity(r));
  }

  async findRequiredActionsByActionId(actionId: string): Promise<DefiModuleAction[]> {
    // The set of required action ids for this action.
    const required = await this.db.query(
      `SELECT a.id
       FROM defi_action_required r
       JOIN defi_module_actions a ON a.id = r.action_required_id
       WHERE r.action_id = $1`,
      [actionId],
    );
    const requiredIds = new Set(required.map((r) => r.id));

    // All modules (nested). Keep only actions in the required set (or all if none).
    const defiModules = await this.db.query(NESTED_MODULE_SELECT);

    const filtered = defiModules.map((item: any) => ({
      ...item,
      defi_module_actions:
        requiredIds.size !== 0
          ? item.defi_module_actions.filter((a: any) => requiredIds.has(a.id))
          : item.defi_module_actions,
    }));

    return filtered as any;
  }
}
