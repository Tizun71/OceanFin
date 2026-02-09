import { Controller, Body, Post, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DefiStrategyVersionService } from '../application/defi_strategy_version.service';
import { CreateDefiStrategyVersionDto } from './dto/create_defi_strategy_version.dto';
import { DefiStrategiesService } from '../application/defi_strategies.service';
import { CreateDefiStrategyDto } from './dto/create_defi_strategy.dto';

@Controller('defi-strategies')
export class DefiStrategiesController {
  constructor(
    private readonly defiStrategyVersionService: DefiStrategyVersionService,
    private readonly defiStrategiesService: DefiStrategiesService,
  ) {}

  @ApiOperation({ summary: 'Create a new DeFi strategy version' })
  @Post('/versions')
  public async createStrategyVersion(
    @Body() body: CreateDefiStrategyVersionDto,
  ) {
    return this.defiStrategyVersionService.createStrategyVersion(body);
  }

  @ApiOperation({ summary: 'Create a new DeFi strategy' })
  @Post()
  public async createStrategy(@Body() body: CreateDefiStrategyDto) {
    return this.defiStrategiesService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get DeFi strategies by owner' })
  @ApiQuery({ name: 'owner', required: true, type: String })
  async getByOwnerId(@Query('owner') owner: string) {
    return this.defiStrategiesService.getByOwnerId(owner);
  }
}
