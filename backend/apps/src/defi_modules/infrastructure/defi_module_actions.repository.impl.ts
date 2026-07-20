import { DefiModuleAction } from '../domain/defi_module_actions.entity';
import { DefiModuleActionsRepository } from '../domain/defi_module_actions.repository';
import { PostgresService } from '../../shared/infrastructure/postgres.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefiModuleActionsRepositoryImplement
  implements DefiModuleActionsRepository
{
  constructor(private readonly db: PostgresService) {}

  public async save(
    defiModuleAction: DefiModuleAction,
  ): Promise<DefiModuleAction> {
    const data = await this.db.queryOne(
      `INSERT INTO defi_module_actions
         (id, module_id, name, pallet, call, description, param_schema, risk_level, is_active, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, COALESCE($10, now()))
       ON CONFLICT (id) DO UPDATE SET
         module_id = EXCLUDED.module_id, name = EXCLUDED.name, pallet = EXCLUDED.pallet,
         call = EXCLUDED.call, description = EXCLUDED.description, param_schema = EXCLUDED.param_schema,
         risk_level = EXCLUDED.risk_level, is_active = EXCLUDED.is_active
       RETURNING *`,
      [
        defiModuleAction.id,
        defiModuleAction.module_id,
        defiModuleAction.name,
        defiModuleAction.pallet,
        defiModuleAction.call,
        defiModuleAction.description,
        // jsonb: stringify so arrays aren't misread as Postgres arrays.
        defiModuleAction.param_schema == null ? null : JSON.stringify(defiModuleAction.param_schema),
        defiModuleAction.risk_level,
        defiModuleAction.is_active,
        defiModuleAction.created_at ?? null,
      ],
    );

    return new DefiModuleAction(
      data.id,
      data.module_id,
      data.name,
      data.pallet,
      data.call,
      data.description,
      data.param_schema,
      data.risk_level,
      data.is_active,
      new Date(data.created_at),
    );
  }
}
