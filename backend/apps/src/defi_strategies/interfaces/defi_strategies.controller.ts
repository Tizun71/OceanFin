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
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DefiStrategyVersionService } from '../application/defi_strategy_version.service';
import { CreateDefiStrategyVersionDto } from './dto/create_defi_strategy_version.dto';
import { UpdateDefiStrategyVersionDto } from './dto/update_defi_strategy_version.dto';
import { DefiStrategiesService } from '../application/defi_strategies.service';
import { CreateDefiStrategyDto } from './dto/create_defi_strategy.dto';
import { UpdateDefiStrategyDto } from './dto/update_defi_strategy.dto';

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
}
