import { DefiStrategyWorkflowNode } from './defi_strategy_workflow_node.entity';

export abstract class DefiStrategyWorkflowNodeRepository {
  abstract save(
    node: DefiStrategyWorkflowNode,
  ): Promise<DefiStrategyWorkflowNode>;
  abstract getByStrategyVersion(
    strategy_version_id: string,
  ): Promise<DefiStrategyWorkflowNode[]>;
}
