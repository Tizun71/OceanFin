import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { DefiModulesService } from "../application/defi_modules.service";
import { CreateDefiModuleDto } from "./dtos/create_defi_module.dto";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { CreateDefiModuleActionDto } from "./dtos/create_defi_module_action.dto";
import { DefiModuleActionsService } from "../application/defi_module_actions.service";
import { CreateDefiPairsDto } from "./dtos/create_defi_pairs.dto";
import { DefiPairsService } from "../application/defi_pairs.service";
import { DefiPair } from "../domain/defi_pairs.entity";
import { v4 as uuidv4 } from "uuid";
import { EstimateDefiPairDto } from "./dtos/estimate-defi-pair.dto";
import { EstimateDefiPairResponseDto } from "./dtos/estimate-defi-pair-response.dto";
import { DefiActionRequiredService } from "../application/defi_action_required.service";
import { CreateDefiActionRequiredDto } from "./dtos/create_defi_action_required.dto";

@Controller("defi-modules")
export class DefiModulesController {
  constructor(
    private readonly defiModulesService: DefiModulesService,
    private readonly defiModuleActionsService: DefiModuleActionsService,
    private readonly defiPairsService: DefiPairsService,
    private readonly defiActionRequiredService: DefiActionRequiredService,
  ) {}

  @ApiOperation({ summary: "Create a new DeFi module" })
  @Post()
  public async createDefiModule(@Body() body: CreateDefiModuleDto) {
    return this.defiModulesService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: "Get all DeFi modules",
  })
  @ApiResponse({
    status: 200,
    description: "List of DeFi modules",
  })
  public async getAllDefiModules() {
    const defiModules = await this.defiModulesService.getAll();
    return defiModules;
  }

  @Post("/actions")
  @ApiOperation({ summary: "Create a new action for a DeFi module" })
  @ApiBody({
    description: "DeFi module action data",
    type: CreateDefiModuleActionDto,
  })
  public async createDefiModuleAction(@Body() body: CreateDefiModuleActionDto) {
    return this.defiModuleActionsService.createAction(body);
  }

  @Post("/actions/required")
  @ApiOperation({
    summary: "Create action required relationship",
    description:
      "Define which action is required after another action. This creates the workflow relationship between actions.",
  })
  @ApiBody({
    description: "Action required relationship data",
    type: CreateDefiActionRequiredDto,
  })
  public async createActionRequired(@Body() body: CreateDefiActionRequiredDto) {
    return this.defiActionRequiredService.createActionRequired(
      body.action_id,
      body.module_id,
      body.action_required_id,
    );
  }

  @Get("/actions/required")
  @ApiOperation({
    summary: "Get valid actions",
  })
  @ApiQuery({ name: "action_id", type: String })
  public async getValidActions(@Query("action_id") action_id: string) {
    return this.defiActionRequiredService.getRequiredActionsByActionId(action_id);
  }

  @ApiOperation({ summary: "Create a new DeFi pair" })
  @Post("/pairs")
  async createDefiPair(@Body() body: CreateDefiPairsDto) {
    return this.defiPairsService.createDefiPair(
      new DefiPair(uuidv4(), body.action_id, body.token_in_id, body.token_out_id),
    );
  }

  @ApiOperation({ summary: "Estimate DeFi operation (SWAP/SUPPLY/BORROW)" })
  @ApiBody({
    description: "Parameters for estimating DeFi operations",
    type: EstimateDefiPairDto,
  })
  @ApiResponse({
    status: 200,
    description: "Estimate result based on operation type",
    type: EstimateDefiPairResponseDto,
  })
  @Post("/pairs/estimate")
  async estimateDefiPair(@Body() body: EstimateDefiPairDto) {
    return this.defiPairsService.estimateDefiPair(body);
  }
}
