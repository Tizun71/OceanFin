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
import { CreateDefiStrategySimulationSnapshotDto } from './dto/create_defi_strategy_simulation_snapshot.dto';
import { DefiStrategySimulationSnapshotService } from '../application/defi_strategy_simullation_snapshot.service';

@ApiTags('DeFi Strategy Simulation Snapshots')
@Controller('defi-strategy-simulation-snapshots')
export class DefiStrategySimulationSnapshotsController {
  constructor(
    private readonly service: DefiStrategySimulationSnapshotService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new simulation snapshot' })
  @ApiResponse({ status: 201, description: 'Snapshot created' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDefiStrategySimulationSnapshotDto) {
    return this.service.create(dto as any);
  }

  @Get('/:version_id')
  @ApiOperation({ summary: 'Get simulation snapshots for a strategy version' })
  @ApiResponse({ status: 200, description: 'List of snapshots' })
  async getByVersion(@Param('version_id') version_id: string) {
    return this.service.getByStrategyVersion(version_id);
  }
}
