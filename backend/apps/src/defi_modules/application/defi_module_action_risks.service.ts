import { Injectable } from "@nestjs/common";
import { DefiModuleActionRisk } from "../domain/defi_module_action_risk.entity";
import { DefiModuleActionRisksRepository } from "../domain/defi_module_action_risks.repository";
import { CreateDefiModuleActionRiskDto } from "../interfaces/dtos/create_defi_module_action_risk.dto";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiModuleActionRisksService {
  constructor(
    private readonly defiModuleActionRisksRepository: DefiModuleActionRisksRepository
  ) { }

  async createDefiModuleActionRisk(dto: CreateDefiModuleActionRiskDto & { action_id: string, defiModuleId: string }): Promise<DefiModuleActionRisk> {
    return this.defiModuleActionRisksRepository.save(new DefiModuleActionRisk(
      uuidv4(),
      dto.action_id,
      dto.risk_type,
      dto.severity,
      dto.description
    ));
  }
}