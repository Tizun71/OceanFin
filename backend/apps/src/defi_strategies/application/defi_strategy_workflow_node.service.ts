import { Injectable, NotFoundException } from '@nestjs/common';
import { DefiStrategyWorkflowNode } from '../domain/defi_strategy_workflow_node.entity';
import { DefiStrategyWorkflowNodeRepository } from '../domain/defi_strategy_workflow_node.repository';
import { DefiStrategyVersionService } from './defi_strategy_version.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiStrategyWorkflowNodeService {
  constructor(
    private readonly repository: DefiStrategyWorkflowNodeRepository,
    private readonly versionService: DefiStrategyVersionService,
  ) {}

  async create(data: Partial<DefiStrategyWorkflowNode>) {
    // ensure strategy version exists
    const version = await this.versionService.getById(
      data.strategy_version_id as string,
    );

    if (!version) throw new NotFoundException('Strategy version not found');

    const id = uuidv4();
    const now = new Date();

    const node = new DefiStrategyWorkflowNode(
      id,
      data.strategy_version_id as string,
      data.module_action_id as string,
      data.node_index as number,
      data.ui_position as object,
      data.params as object,
      now,
    );

    return this.repository.save(node);
  }

  async update(id: string, updates: Partial<DefiStrategyWorkflowNode>) {
    return this.repository.update(id, updates);
  }

  async getByStrategyVersion(strategy_version_id: string) {
    return this.repository.getByStrategyVersion(strategy_version_id);
  }
}
