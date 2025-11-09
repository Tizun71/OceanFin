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

  async find(id?: string, userAddress?: string): Promise<Activity[]> {
  if (!id && !userAddress) {
    return this.activityRepo.findAll();
  }

  const result = await this.activityRepo.findByFilter({ id, userAddress });

  return result ?? [];
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

  async updateProgress(dto: UpdateActivityProgressDto): Promise<Activity> {
    if (!dto.activityId) throw new Error('activityId is required');

    const activities = await this.find(dto.activityId);
    const activity = activities[0];
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
    await this.activityRepo.save(activity);
    return activity;
  }

  async resumeActivity(activityId: string): Promise<Activity> {
    const activity = (await this.find(activityId))[0];
    if (!activity) throw new Error('Activity not found');

    if (activity.status !== 'FAILED') {
      throw new Error('Only FAILED activity can be resumed');
    }
    activity.status = 'PENDING';
    await this.activityRepo.save(activity);
    return activity;
  }
}
