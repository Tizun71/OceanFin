import { DefiModuleAction } from 'src/defi_modules/domain/defi_module_actions.entity';
import { DefiModule } from 'src/defi_modules/domain/defi_modules.entity';

export class DefiModulesMapper {
  static toResponse(entity: DefiModule & { actions: DefiModuleAction[] }) {
    return {
      id: entity.id,
      name: entity.name,
      protocol: entity.protocol,
      category: entity.category,
      parachain_id: entity.parachain_id,
      icon_url: entity.icon_url,
      description: entity.description,
      website_url: entity.website_url,
      is_active: entity.is_active,
      actions: entity.actions,
      created_at: entity.created_at,
    };
  }

  static toResponseList(entities: (DefiModule & { actions: DefiModuleAction[] })[]) {
    return entities.map((e) => this.toResponse(e));
  }
}
