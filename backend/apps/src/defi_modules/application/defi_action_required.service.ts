import { Injectable } from '@nestjs/common';
import { DefiActionRequiredRepository } from '../domain/defi_action_required.repository';
import { DefiActionRequired } from '../domain/defi_action_required.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiActionRequiredService {
  constructor(
    private readonly defiActionRequiredRepository: DefiActionRequiredRepository,
  ) {}

  async createActionRequired(
    actionId: string,
    moduleId: string,
    actionRequiredId: string,
  ): Promise<DefiActionRequired> {
    return this.defiActionRequiredRepository.save(
      new DefiActionRequired(uuidv4(), actionId, moduleId, actionRequiredId),
    );
  }

  async getRequiredActionsByActionId(actionId: string) {
    return this.defiActionRequiredRepository.findRequiredActionsByActionId(
      actionId,
    );
  }
}
