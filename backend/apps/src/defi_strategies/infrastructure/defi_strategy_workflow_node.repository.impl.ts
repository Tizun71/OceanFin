import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/infrastructure/supabase.service';
import { DefiStrategyWorkflowNode } from '../domain/defi_strategy_workflow_node.entity';
import { DefiStrategyWorkflowNodeRepository } from '../domain/defi_strategy_workflow_node.repository';

@Injectable()
export class DefiStrategyWorkflowNodeRepositoryImpl
  implements DefiStrategyWorkflowNodeRepository
{
  constructor(private readonly supabase: SupabaseService) {}

  async save(node: DefiStrategyWorkflowNode) {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_workflow_nodes')
      .upsert({
        id: node.id,
        strategy_version_id: node.strategy_version_id,
        module_action_id: node.module_action_id,
        node_index: node.node_index,
        ui_position: node.ui_position,
        params: node.params,
        created_at: node.created_at,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to save workflow node: ${error.message}`);

    return new DefiStrategyWorkflowNode(
      data.id,
      data.strategy_version_id,
      data.module_action_id,
      data.node_index,
      data.ui_position,
      data.params,
      new Date(data.created_at),
    );
  }

  async getByStrategyVersion(strategy_version_id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_workflow_nodes')
      .select('*')
      .eq('strategy_version_id', strategy_version_id)
      .order('node_index', { ascending: true });

    if (error)
      throw new Error(`Failed to get workflow nodes: ${error.message}`);

    return (data || []).map(
      (item: any) =>
        new DefiStrategyWorkflowNode(
          item.id,
          item.strategy_version_id,
          item.module_action_id,
          item.node_index,
          item.ui_position,
          item.params,
          new Date(item.created_at),
        ),
    );
  }

  async update(id: string, updates: Partial<DefiStrategyWorkflowNode>) {
    const updateData: Record<string, unknown> = {};
    if (updates.module_action_id !== undefined)
      updateData.module_action_id = updates.module_action_id;
    if (updates.node_index !== undefined)
      updateData.node_index = updates.node_index;
    if (updates.ui_position !== undefined)
      updateData.ui_position = updates.ui_position;
    if (updates.params !== undefined) updateData.params = updates.params;

    const { data, error } = await this.supabase
      .getClient()
      .from('defi_strategy_workflow_nodes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update workflow node: ${error.message}`);

    return new DefiStrategyWorkflowNode(
      data.id,
      data.strategy_version_id,
      data.module_action_id,
      data.node_index,
      data.ui_position,
      data.params,
      new Date(data.created_at),
    );
  }
}
