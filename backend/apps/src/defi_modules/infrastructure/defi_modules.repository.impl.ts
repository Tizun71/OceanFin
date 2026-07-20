import { Injectable, NotFoundException } from "@nestjs/common";
import { DefiModulesRepository } from "../domain/defi_modules.repository";
import { DefiModule } from "../domain/defi_modules.entity";
import { PostgresService } from "../../shared/infrastructure/postgres.service";

/**
 * Nested module → actions → pairs → tokens shape, assembled with jsonb_agg to
 * mirror the previous PostgREST nested select. Returns each module row with a
 * `defi_module_actions` jsonb array (each action carries its `defi_pairs`, and
 * each pair its `token_in` / `token_out` token objects).
 */
export const NESTED_MODULE_SELECT = `
  SELECT m.*,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id, 'module_id', a.module_id, 'name', a.name, 'pallet', a.pallet,
        'call', a.call, 'description', a.description, 'param_schema', a.param_schema,
        'risk_level', a.risk_level, 'is_active', a.is_active, 'created_at', a.created_at,
        'defi_pairs', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', p.id,
            'token_in', to_jsonb(ti.*),
            'token_out', to_jsonb(tou.*)
          ))
          FROM defi_pairs p
          LEFT JOIN defi_token ti ON ti.id = p.token_in_id
          LEFT JOIN defi_token tou ON tou.id = p.token_out_id
          WHERE p.action_id = a.id
        ), '[]'::jsonb)
      ))
      FROM defi_module_actions a WHERE a.module_id = m.id
    ), '[]'::jsonb) AS defi_module_actions
  FROM defi_modules m
`;

@Injectable()
export class DefiModulesRepositoryImplement implements DefiModulesRepository {
  constructor(private readonly db: PostgresService) {}

  async findAll(chain?: string) {
    const params: unknown[] = [];
    let sql = NESTED_MODULE_SELECT;
    if (chain) {
      params.push(chain);
      sql += ` WHERE m.chain = $${params.length}`;
    }
    return (await this.db.query(sql, params)) as any;
  }

  async save(defiModule: DefiModule): Promise<DefiModule> {
    const row = await this.db.queryOne(
      `INSERT INTO defi_modules
         (id, name, protocol, category, parachain_id, icon_url, description, website_url, is_active, created_at, chain, chain_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, COALESCE($10, now()), $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, protocol = EXCLUDED.protocol, category = EXCLUDED.category,
         parachain_id = EXCLUDED.parachain_id, icon_url = EXCLUDED.icon_url,
         description = EXCLUDED.description, website_url = EXCLUDED.website_url,
         is_active = EXCLUDED.is_active, chain = EXCLUDED.chain, chain_id = EXCLUDED.chain_id
       RETURNING *`,
      [
        defiModule.id,
        defiModule.name,
        defiModule.protocol,
        defiModule.category,
        defiModule.parachain_id,
        defiModule.icon_url,
        defiModule.description,
        defiModule.website_url,
        defiModule.is_active,
        defiModule.created_at ?? null,
        defiModule.chain,
        defiModule.chain_id,
      ],
    );

    return new DefiModule(
      row.id,
      row.name,
      row.protocol,
      row.category,
      row.parachain_id,
      row.icon_url,
      row.description,
      row.website_url,
      row.is_active,
      new Date(row.created_at),
      row.chain ?? "polkadot",
      row.chain_id ?? null,
    );
  }

  async findById(id: string) {
    const row = await this.db.queryOne(`${NESTED_MODULE_SELECT} WHERE m.id = $1`, [id]);
    if (!row) throw new NotFoundException("Defi Module not found");
    return row;
  }
}
