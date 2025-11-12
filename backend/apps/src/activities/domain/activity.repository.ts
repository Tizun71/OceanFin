import { Activity } from './activity.entity';

export abstract class ActivityRepository {
  abstract findAll(): Promise<Activity[]>;
  abstract findByFilter(filters: { strategyId?: string; userAddress?: string }): Promise<Activity[]>;
  abstract findById(id: string): Promise<Activity | null>;
  abstract findPaginated(filters: {
    strategyId?: string;
    userAddress?: string;
    offset: number;
    limit: number;
  }): Promise<{ data: Activity[]; total: number }>;
  abstract save(activity: Activity): Promise<void>;
}


