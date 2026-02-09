import { Body, Controller, Get, Post } from '@nestjs/common';
import { DefiModulesService } from '../application/defi_modules.service';
import { CreateDefiModuleDto } from './dtos/create_defi_module.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDefiModuleActionDto } from './dtos/create_defi_module_action.dto';
import { DefiModuleActionsService } from '../application/defi_module_actions.service';
import { CreateDefiPairsDto } from './dtos/create_defi_pairs.dto';
import { DefiPairsService } from '../application/defi_pairs.service';
import { DefiPair } from '../domain/defi_pairs.entity';
import { v4 as uuidv4 } from 'uuid';

@Controller('defi-modules')
export class DefiModulesController {
  constructor(
    private readonly defiModulesService: DefiModulesService,
    private readonly defiModuleActionsService: DefiModuleActionsService,
    private readonly defiPairsService: DefiPairsService,
  ) {}

  @ApiOperation({ summary: 'Create a new DeFi module' })
  @Post()
  public async createDefiModule(@Body() body: CreateDefiModuleDto) {
    return this.defiModulesService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all DeFi modules with optional sorting and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of DeFi modules',
  })
  public async getAllDefiModules() {
    const defiModules = await this.defiModulesService.getAll();
    return defiModules;
  }

  @Post('/actions')
  @ApiOperation({ summary: 'Create a new action for a DeFi module' })
  @ApiBody({
    description: 'DeFi module action data',
    type: CreateDefiModuleActionDto,
  })
  public async createDefiModuleAction(@Body() body: CreateDefiModuleActionDto) {
    return this.defiModuleActionsService.createAction(body);
  }

  @ApiOperation({ summary: 'Create a new DeFi pair' })
  @Post('/pairs')
  async createDefiPair(@Body() body: CreateDefiPairsDto) {
    return this.defiPairsService.createDefiPair(
      new DefiPair(
        uuidv4(),
        body.action_id,
        body.token_in_id,
        body.token_out_id,
      ),
    );
  }
}
