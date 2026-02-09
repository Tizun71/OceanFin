import { Controller, Body, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
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
}
