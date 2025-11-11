import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../domain/activity.repository';
import { Activity, ActivityStatus } from '../domain/activity.entity';
import { UpdateActivityProgressDto } from '../interfaces/dtos/update-activity-progress.dto';
import { CreateActivityDto } from '../interfaces/dtos/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async findAll(): Promise<Activity[]> {
    return this.activityRepo.findAll();
  }

  async find(strategyId?: string, userAddress?: string): Promise<Activity[]> {
    if (!strategyId && !userAddress) {
      return this.activityRepo.findAll();
    }

    const result = await this.activityRepo.findByFilter({ strategyId, userAddress });

    return result ?? [];
  }

  async findById(id: string): Promise<Activity | null> {
    return this.activityRepo.findById(id);
  }

  async findWithPagination(
    strategyId?: string,
    userAddress?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Activity[]; meta: any }> {
    const offset = (page - 1) * limit;
    const { data, total } = await this.activityRepo.findPaginated({ strategyId, userAddress, offset, limit });
    const totalPages = Math.ceil(total / limit);

    return { data, meta: { page, limit, total, totalPages } };
  }



  async create(dto: CreateActivityDto): Promise<Activity> {
  const id = crypto.randomUUID(); 

  const activity = new Activity(
    id,                       
    dto.userAddress,
    dto.strategyId,
    [],                       
    'PENDING',                
    { initial_capital: dto.initialCapital },
    dto.currentStep ?? 1,
    dto.totalSteps ?? 8,
    new Date()
  );

  await this.activityRepo.save(activity);
  return activity;
  }

  async updateProgress(id: string, dto: UpdateActivityProgressDto): Promise<Activity> {
    const activity = await this.findById(id);
    if (!activity) throw new Error('Activity not found');

    const totalSteps = activity.totalSteps ?? 8;
    activity.totalSteps = totalSteps;
    activity.currentStep = dto.step;

    if (dto.status === 'FAILED') {
      activity.status = 'FAILED';
    } else if (dto.step >= totalSteps) {
      activity.status = 'SUCCESS';
    } else {
      activity.status = 'PENDING';
    }

    if (dto.txHash) {
      const txArray = Array.isArray(dto.txHash) ? dto.txHash : [dto.txHash];

      const cleanHashes = Array.from(
        new Set(
          txArray
            .map((hash) => String(hash).trim())
            .filter((hash) => hash.length > 0)
        )
      );

      const existingTx = Array.isArray(activity.txHash) ? activity.txHash : [];
      activity.txHash = Array.from(new Set([...existingTx, ...cleanHashes]));
    }

    await this.activityRepo.save(activity);
    return activity;
  }



  async resumeActivity(activityId: string): Promise<Activity> {
    const activity = await this.findById(activityId);
    if (!activity) throw new Error('Activity not found');

    if (activity.status !== 'FAILED') {
      throw new Error('Only FAILED activity can be resumed');
    }
    activity.status = 'PENDING';
    await this.activityRepo.save(activity);
    return activity;
  }
}
