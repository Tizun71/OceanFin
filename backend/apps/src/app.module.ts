import { Module } from '@nestjs/common';
import { SupabaseModule } from './shared/supabase.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { StrategiesModule } from './strategies/stategies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    SupabaseModule,
    UsersModule,
    StrategiesModule,
  ],
})
export class AppModule {}
