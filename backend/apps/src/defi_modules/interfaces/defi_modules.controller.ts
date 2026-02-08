import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DefiModulesService } from '../application/defi_modules.service';
import { CreateDefiModuleDto } from './dtos/create_defi_module.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDefiModuleActionDto } from './dtos/create_defi_module_action.dto';
import { DefiModuleActionsService } from '../application/defi_module_actions.service';

@Controller('defi-modules')
export class DefiModulesController {
  constructor(
    private readonly defiModulesService: DefiModulesService,
    private readonly defiModuleActionsService: DefiModuleActionsService,
  ) { }

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

  @Post('/:id/actions')
  @ApiOperation({ summary: 'Create a new action for a DeFi module' })
  @ApiBody({
    description: 'DeFi module action data',
    type: CreateDefiModuleActionDto,
  })
  public async createDefiModuleAction(
    @Param('id') defiModuleId: string,
    @Body() body: CreateDefiModuleActionDto,
  ) {
    return this.defiModuleActionsService.createAction(defiModuleId, {
      name: body.name,
      pallet: body.pallet,
      call: body.call,
      description: body.description,
      param_schema: body.param_schema,
      risk_level: body.risk_level,
      is_active: body.is_active,
    });
  }
}
