import { Module } from '@nestjs/common';
import { ActivityController } from './interfaces/activity.controller';
import { ActivityService } from './application/activity.service';
import { ActivityRepository } from './domain/activity.repository';
import { ActivityRepositoryImplement } from './infrastructure/activity.repository.impl';
import { SupabaseModule } from '../shared/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ActivityController],
  providers: [
    ActivityService,
    { provide: ActivityRepository, useClass: ActivityRepositoryImplement },
  ],
  exports: [ActivityService],
})
export class ActivitiesModule {}

