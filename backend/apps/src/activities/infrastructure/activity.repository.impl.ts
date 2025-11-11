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

  async findByFilter(filters: { strategyId?: string; userAddress?: string }): Promise<Activity[]> {
    try {
      let query = this.supabase.getClient().from('activities').select('*');
      if (filters.strategyId) {
        query = query.eq('strategy_id', filters.strategyId);
      }
      if (filters.userAddress) {
        query = query.eq('user_address', filters.userAddress);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.warn(`No activities found with filters: ${JSON.stringify(filters)}, error: ${error.message}`);
        return [];
      }
      if (!data || data.length === 0) {
        return [];
      }
      return data.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Error fetching activities with filters: ${JSON.stringify(filters)}`, errorMessage);
      return [];
    }
  }

  async findById(id: string): Promise<Activity | null> {
    try {
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
    } catch (error) {
      console.warn(`Error fetching activity by id: ${id}`, error);
      return null;
    }
  }

  async findPaginated(filters: { strategyId?: string; userAddress?: string; offset: number; limit: number }) {
    let query = this.supabase
      .getClient()
      .from('activities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.strategyId) query = query.eq('strategy_id', filters.strategyId);
    if (filters.userAddress) query = query.eq('user_address', filters.userAddress);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch paginated activities: ${error.message}`);

    return {
      data: (data || []).map((row) => this.mapRowToEntity(row)),
      total: count || 0,
    };
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
    let txHash: string | null = null;
    if (row.tx_hash) {
      if (Array.isArray(row.tx_hash)) {
        txHash = row.tx_hash.join('');
      } else if (typeof row.tx_hash === 'string') {
        txHash = row.tx_hash;
      }
    }

    return new Activity(
      row.id,
      row.user_address,
      row.strategy_id,
      row.tx_hash ?? [],
      row.status as ActivityStatus,
      row.metadata || undefined,
      row.current_step || undefined,
      row.total_steps || undefined,
      row.created_at ? new Date(row.created_at) : undefined,
    );
  }
}

