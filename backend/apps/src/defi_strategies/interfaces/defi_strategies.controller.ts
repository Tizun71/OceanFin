import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { DefiStrategyVersionService } from '../application/defi_strategy_version.service';
import { CreateDefiStrategyVersionDto } from './dto/create_defi_strategy_version.dto';
import { UpdateDefiStrategyVersionDto } from './dto/update_defi_strategy_version.dto';
import { DefiStrategiesService } from '../application/defi_strategies.service';
import { CreateDefiStrategyDto } from './dto/create_defi_strategy.dto';
import { UpdateDefiStrategyDto } from './dto/update_defi_strategy.dto';
import { StrategySimulationService } from '../application/strategy-simulation.service';
import { SimulateStrategyDto } from './dtos/simulate-strategy.dto';
import { SimulationResultDto } from './dtos/simulation-result.dto';

@ApiTags('DeFi Strategies')
@Controller('defi-strategies')
export class DefiStrategiesController {
  constructor(
    private readonly defiStrategyVersionService: DefiStrategyVersionService,
    private readonly defiStrategiesService: DefiStrategiesService,
    private readonly simulationService: StrategySimulationService,
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
  @ApiOperation({
    summary: 'Get all DeFi strategies, optionally filtered by owner',
  })
  @ApiQuery({ name: 'owner', required: false, type: String })
  async getAll(@Query('owner') owner?: string) {
    return this.defiStrategiesService.getAll(owner);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a DeFi strategy' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the DeFi strategy to update',
  })
  public async updateStrategy(
    @Param('id') id: string,
    @Body() body: UpdateDefiStrategyDto,
  ) {
    return this.defiStrategiesService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a DeFi strategy and all its versions (cascade delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the DeFi strategy to delete',
  })
  public async deleteStrategy(@Param('id') id: string) {
    return this.defiStrategiesService.delete(id);
  }

  @Put('versions/:id')
  @ApiOperation({ summary: 'Update a DeFi strategy version' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the DeFi strategy version to update',
  })
  public async updateStrategyVersion(
    @Param('id') id: string,
    @Body() body: UpdateDefiStrategyVersionDto,
  ) {
    return this.defiStrategyVersionService.update(id, body);
  }

  @Delete('versions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a DeFi strategy version' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the DeFi strategy version to delete',
  })
  public async deleteStrategyVersion(@Param('id') id: string) {
    return this.defiStrategyVersionService.delete(id);
  }

  @Post(':id/simulate')
  @ApiOperation({
    summary: 'Simulate strategy and return in execution format',
    description:
      'Returns simulation result transformed to execution format with loops, fee, and simplified steps',
  })
  @ApiParam({ name: 'id', description: 'Strategy ID' })
  @ApiBody({ type: SimulateStrategyDto })
  @ApiResponse({
    status: 200,
    description: 'Simulation completed and transformed to execution format',
  })
  @ApiResponse({ status: 404, description: 'Strategy not found' })
  @ApiResponse({ status: 500, description: 'Simulation failed' })
  public async simulate(
    @Param('id') id: string,
    @Body() simulateDto: SimulateStrategyDto,
  ): Promise<any> {
    const simulationResult = await this.simulationService.simulateStrategy(
      id,
      simulateDto.amount_in,
      {
        slippage_tolerance: simulateDto.slippage_tolerance,
        gas_price: simulateDto.gas_price,
      },
    );

    return this.simulationService.transformToExecutionFormat(simulationResult);
  }
}
