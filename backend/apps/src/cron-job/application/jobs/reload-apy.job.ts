import { Injectable, OnModuleInit } from '@nestjs/common';
import cron from 'node-cron';
import { StrategyService } from 'src/strategies/application/strategy.service';

@Injectable()
export class apyJob implements OnModuleInit {
  constructor(private readonly strategyService: StrategyService) { }

  async onModuleInit() {
    await this.strategyService.reloadAllAPY();

    cron.schedule('0 0 0 * * *', async () => {
      console.log('Reload APY once per day');
      await this.strategyService.reloadAllAPY();
    });
  }
}
