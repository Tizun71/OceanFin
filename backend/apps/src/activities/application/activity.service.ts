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
      // Chuyển đổi txHash thành array nếu là string, hoặc giữ nguyên nếu đã là array
      const txHashArray = Array.isArray(dto.txHash) ? dto.txHash : [dto.txHash];
      // Lọc bỏ các giá trị rỗng và chuyển đổi thành string
      const validTxHashes = txHashArray
        .map(hash => String(hash).trim())
        .filter(hash => hash.length > 0);
      if (validTxHashes.length > 0) {
        // Thêm các txHash mới vào array hiện tại
        activity.txHash = [...(activity.txHash || []), ...validTxHashes];
      }
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
