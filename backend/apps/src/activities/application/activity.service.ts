import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../domain/activity.repository';
import { Activity, ActivityStatus } from '../domain/activity.entity';
import { UpdateActivityProgressDto } from '../interfaces/dtos/update-activity-progress.dto';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async findAll(): Promise<Activity[]> {
    return this.activityRepo.findAll();
  }

  async findById(id: string): Promise<Activity> {
    const activity = await this.activityRepo.findById(id);
    if (!activity) throw new Error('Activity not found');
    return activity;
  }

  async updateProgress(dto: UpdateActivityProgressDto): Promise<Activity> {
    if (!dto.activityId) throw new Error('activityId is required');

    const activity = await this.findById(dto.activityId);
    const totalSteps = activity.totalSteps ?? 8;
    activity.totalSteps = totalSteps;

    if (dto.status === 'FAILED') {
      activity.currentStep = dto.step;
      activity.status = 'FAILED';
    } else if (dto.step && dto.step >= totalSteps) {
      activity.currentStep = dto.step;
      activity.status = 'SUCCESS';
    } else {
      activity.currentStep = dto.step;
      activity.status = 'PENDING';
    }

    if (dto.message) {
      activity.metadata = { ...activity.metadata, message: dto.message };
    }

    await this.activityRepo.save(activity);
    return activity;
  }

  async resumeActivity(dto: UpdateActivityProgressDto): Promise<Activity> {
    const activity = await this.findById(dto.activityId);

    if (activity.status !== 'FAILED') {
      throw new Error('Only FAILED activity can be resumed');
    }

    activity.status = 'PENDING';

    if (dto.message) {
      activity.metadata = { ...activity.metadata, message: dto.message };
    }

    await this.activityRepo.save(activity);
    return activity;
  }
}
