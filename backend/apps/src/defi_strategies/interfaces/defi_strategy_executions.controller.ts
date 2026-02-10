import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDefiStrategyExecutionDto } from './dto/create_defi_strategy_execution.dto';
import { DefiStrategyExecutionService } from '../application/defi_strategy_execution.service';
import { UpdateDefiStrategyExecutionDto } from './dto/update_defi_strategy_execution.dto';

@ApiTags('DeFi Strategy Executions')
@Controller('defi-strategy-executions')
export class DefiStrategyExecutionsController {
  constructor(private readonly service: DefiStrategyExecutionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new strategy execution' })
  @ApiResponse({ status: 201, description: 'Execution created' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDefiStrategyExecutionDto) {
    return this.service.create(dto);
  }

  @Get(':version_id')
  @ApiOperation({ summary: 'Get executions by strategy version' })
  @ApiResponse({ status: 200, description: 'List of executions' })
  async getByVersion(@Param('version_id') version_id: string) {
    return this.service.getByStrategyVersion(version_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an execution' })
  @ApiResponse({ status: 200, description: 'Execution updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDefiStrategyExecutionDto,
  ) {
    return this.service.update(id, dto as any);
  }
}
