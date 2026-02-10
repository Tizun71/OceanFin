import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDefiStrategyWorkflowNodeDto } from './dto/create_defi_strategy_workflow_node.dto';
import { DefiStrategyWorkflowNodeService } from '../application/defi_strategy_workflow_node.service';

@ApiTags('DeFi Strategy Workflow Nodes')
@Controller('defi-strategy-workflow-nodes')
export class DefiStrategyWorkflowNodesController {
  constructor(private readonly service: DefiStrategyWorkflowNodeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow node' })
  @ApiResponse({ status: 201, description: 'Node created' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDefiStrategyWorkflowNodeDto) {
    return this.service.create(dto as any);
  }

  @Get(':version_id')
  @ApiOperation({ summary: 'Get nodes by strategy version' })
  @ApiResponse({ status: 200, description: 'List of nodes' })
  async getByVersion(@Param('version_id') version_id: string) {
    return this.service.getByStrategyVersion(version_id);
  }
}
