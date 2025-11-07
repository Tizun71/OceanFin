import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StrategyService } from '../application/strategy.service';
import { StrategyMapper } from '../application/mappers/strategy.mapper';
import { StrategyResponseDto } from './dtos/strategy-response.dto';
import { CreateStrategyDto } from './dtos/create-strategy.dto';
import { UpdateStrategyDto } from './dtos/update-strategy.dto';
import { SimulateResult } from '../infrastructure/strategy-simulate/type';
import { SimulateResultDto } from './dtos/simulate.dto';

@ApiTags('Strategies')
@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategyService: StrategyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new strategy' })
  @ApiResponse({ status: 201, description: 'Strategy created', type: StrategyResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateStrategyDto): Promise<StrategyResponseDto> {
    const created = await this.strategyService.create(dto);
    return StrategyMapper.toResponse(created);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get strategy by ID' })
  @ApiParam({ name: 'id', description: 'Strategy ID' })
  @ApiResponse({ status: 200, description: 'Strategy found', type: StrategyResponseDto })
  async findById(@Param('id') id: string): Promise<StrategyResponseDto> {
    const found = await this.strategyService.findById(id);
    return StrategyMapper.toResponse(found);
  }

  @Get()
@ApiOperation({ summary: 'List all strategies with optional filter/sort/limit' })
@ApiQuery({ name: 'sortBy', required: false, example: 'apy' })
@ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], example: 'desc' })
@ApiQuery({ name: 'limit', required: false, example: 5 })
async findAll(
  @Query('sortBy') sortBy?: string,
  @Query('order') order: 'asc' | 'desc' = 'desc',
  @Query('limit') limit?: number,
): Promise<StrategyResponseDto[]> {
  const list = await this.strategyService.findAll(sortBy, order, limit ? Number(limit) : undefined);
  return StrategyMapper.toResponseList(list);
}


  @Put(':id')
  @ApiOperation({ summary: 'Update a strategy by ID' })
  @ApiParam({ name: 'id', description: 'Strategy ID' })
  @ApiResponse({ status: 200, description: 'Strategy updated', type: StrategyResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStrategyDto,
  ): Promise<StrategyResponseDto> {
    const updated = await this.strategyService.update(id, dto);
    return StrategyMapper.toResponse(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a strategy by ID' })
  @ApiParam({ name: 'id', description: 'Strategy ID' })
  @ApiResponse({ status: 204, description: 'Strategy deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.strategyService.deleteById(id);
  }

  @Get(':id/simulate')
  @ApiOperation({ summary: 'Simulate a strategy and return structured result' })
  @ApiParam({ name: 'id', description: 'Strategy ID' })
  @ApiQuery({ name: 'assetIdIn', description: 'Asset ID to simulate with', example: '5' })
  @ApiQuery({ name: 'amountIn', description: 'Amount to simulate', example: 1 })
  @ApiQuery({ name: 'iterations', description: 'Number of iterations', example: 3, required: false })
  @ApiResponse({ status: 200, description: 'Simulation result', type: SimulateResultDto })
  async simulate(
    @Param('id') id: string,
    @Query('assetIn') assetIn: string,
    @Query('amountIn') amountIn: number,
    @Query('iterations') iterations: number = 3
  ): Promise<SimulateResult> {
    return this.strategyService.simulateStrategy(id, assetIn, amountIn, iterations);
  }
}


