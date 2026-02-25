import { Module } from '@nestjs/common';
import { SupabaseModule } from './shared/supabase.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { StrategiesModule } from './strategies/stategies.module';
import { ActivitiesModule } from './activities/activities.module';
import { CronManagerService } from './cron-job/application/cron-manager.service';
import { DefiAgentModule } from './defi_agent/defi_agent.module';
import { DefiModulesModule } from './defi_modules/defi_modules.module';
import { DefiUsersModule } from './defi_users/defi_users.module';
import { DefiStrategiesModule } from './defi_strategies/defi_strategies.module';
import { DefiTokenModule } from './defi_token/defi_token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    DefiAgentModule,
    SupabaseModule,
    UsersModule,
    StrategiesModule,
    ActivitiesModule,
    DefiModulesModule,
    DefiUsersModule,
    DefiStrategiesModule,
    DefiTokenModule,
  ],
  providers: [CronManagerService],
})
export class AppModule {}
