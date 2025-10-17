import { Injectable, OnModuleInit } from '@nestjs/common';
import cron, { ScheduledTask } from 'node-cron';
import { StrategyService } from 'src/strategies/application/strategy.service';

interface CronDefinition {
  name: string;
  schedule: string;
  job: () => Promise<void>;
}

@Injectable()
export class CronManagerService implements OnModuleInit {
  private tasks: Record<string, ScheduledTask> = {};

  constructor(private readonly reloadApyJob: StrategyService) {}

  async onModuleInit() {
    this.registerCronJobs();
  }

  private registerCronJobs() {
    const jobs: CronDefinition[] = [
      {
        name: 'reload-apy',
        schedule: '*/30 * * * * *',
        job: async () => await this.reloadApyJob.reloadAllAPY(),
      },
    ];

    jobs.forEach(({ name, schedule, job }) => {
      const task = cron.schedule(schedule, job);
      this.tasks[name] = task;
    });
  }
  async runJobNow(name: string) {
    const job = this.tasks[name];
    if (!job) throw new Error(`Job "${name}" not found`);
    await (job as any).job?.();
  }
  stopJob(name: string) {
    this.tasks[name]?.stop();
  }
  startJob(name: string) {
    this.tasks[name]?.start();
  }
}
