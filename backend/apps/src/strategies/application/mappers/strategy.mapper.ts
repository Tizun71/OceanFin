import { Strategy } from '../../domain/strategies.entity';
import { StrategyResponseDto } from '../../interfaces/dtos/strategy-response.dto';

export class StrategyMapper {
  static toResponse(entity: Strategy): StrategyResponseDto {
    return {
      id: entity.id,
      strategistName: entity.strategistName,
      strategistHandle: entity.strategistHandle,
      apy: entity.apy,
      tags: entity.tags,
      assets: entity.assets,
      agents: entity.agents,
      chains: entity.chains,
    };
  }

  static toResponseList(entities: Strategy[]): StrategyResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}



