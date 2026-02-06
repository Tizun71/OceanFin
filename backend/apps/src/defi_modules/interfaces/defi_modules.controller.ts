import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { DefiModulesService } from '../application/defi_modules.service';
import { CreateDefiModuleDto } from './dtos/create_defi_module.dto';
import { DefiModulesMapper } from '../application/mappers/defi_modules.mapper';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('defi-modules')
export class DefiModulesController {
  constructor(private readonly defiModulesService: DefiModulesService) {}

  @ApiOperation({ summary: 'Create a new DeFi module' })
  @Post()
  public async createDefiModule(
    @Body(new ValidationPipe()) body: CreateDefiModuleDto,
  ) {
    return this.defiModulesService.create(body);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a DeFi module by ID' })
  public async getDefiModuleById(@Param('id') id: string) {
    const defiModule = await this.defiModulesService.getById(id);
    return DefiModulesMapper.toResponse(defiModule);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all DeFi modules with optional sorting and pagination',
  })
  public async getAllDefiModules(
    @Query('sortBy') sortBy?: string,
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const defiModules = await this.defiModulesService.getAll(
      sortBy,
      order,
      limit,
      page,
    );

    return {
      total: defiModules.length,
      data: DefiModulesMapper.toResponseList(defiModules),
    };
  }
}
