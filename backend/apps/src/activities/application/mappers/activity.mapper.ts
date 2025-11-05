import { Activity } from '../../domain/activity.entity';
import { ActivityResponseDto } from '../../interfaces/dtos/activity-response.dto';

export class ActivityMapper {
  static toResponse(entity: Activity): ActivityResponseDto {
    return {
      id: entity.id,
      userAddress: entity.userAddress,
      strategyId: entity.strategyId,
      txHash: entity.txHash,
      status: entity.status,
      metadata: entity.metadata,
      currentStep: entity.currentStep,
      totalSteps: entity.totalSteps,
      createdAt: entity.createdAt,
    };
  }

  static toResponseList(entities: Activity[]): ActivityResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}

