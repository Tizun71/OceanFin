import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../domain/activity.repository';
import { Activity, ActivityStatus } from '../domain/activity.entity';
import { SupabaseService } from 'src/shared/infrastructure/supabase.service';

@Injectable()
export class ActivityRepositoryImplement implements ActivityRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Activity[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToEntity(row));
  }

  async findById(id: string): Promise<Activity | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToEntity(data);
  }

  async save(activity: Activity): Promise<void> {
    const payload: any = {
      id: activity.id,
      user_address: activity.userAddress,
      strategy_id: activity.strategyId,
      tx_hash: activity.txHash ?? [],
      status: activity.status,
      metadata: activity.metadata ?? null,
      current_step: activity.currentStep ?? null,
      total_steps: activity.totalSteps ?? null,
      created_at: activity.createdAt ?? undefined,
    };

    const { error } = await this.supabase
      .getClient()
      .from('activities')
      .upsert(payload);

    if (error) {
      throw new Error(`Failed to save activity: ${error.message}`);
    }
  }

  private mapRowToEntity(row: any): Activity {
    return new Activity(
      row.id,
      row.user_address,
      row.strategy_id,
      row.tx_hash || [],
      row.status as ActivityStatus,
      row.metadata || undefined,
      row.current_step || undefined,
      row.total_steps || undefined,
      row.created_at ? new Date(row.created_at) : undefined,
    );
  }
}

