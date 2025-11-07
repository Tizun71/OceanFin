import { Activity } from './activity.entity';

export abstract class ActivityRepository {
  abstract findAll(): Promise<Activity[]>;
  abstract findByFilter(filters: { id?: string; userAddress?: string }): Promise<Activity[]>; 
  abstract save(activity: Activity): Promise<void>;
}


