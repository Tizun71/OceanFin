import { Module } from '@nestjs/common';
import { DefiAgentService } from './application/defi_agent.service';
import { DefiAgentController } from './interfaces/defi_agent.controller';

@Module({
  providers: [DefiAgentService],
  controllers: [DefiAgentController],
})
export class DefiAgentModule {}
