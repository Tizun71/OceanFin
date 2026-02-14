import { Body, Controller, Post, Res } from '@nestjs/common';
import { DefiAgentService } from '../application/defi_agent.service';
import { type Response } from 'express';
import { CreateStrategyPromptDTO } from './dto/create_strategy_prompt';

@Controller('defi-agent')
export class DefiAgentController {
  constructor(private readonly defiAgentService: DefiAgentService) {}

  @Post('create-strategy')
  async createStrategy(
    @Res() res: Response,
    @Body() body: CreateStrategyPromptDTO,
  ): Promise<void> {
    return this.defiAgentService.createStrategy(body.prompt, res, body.amount);
  }
}
