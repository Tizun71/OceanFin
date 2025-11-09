import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './interfaces/user.controller';
import { UserRepository } from './domain/user.repository';
import { UserRepositoryImplement } from './infrastructure/user.repository.impl';
import { SupabaseModule } from '../shared/supabase.module';
import { HydrationSdkService } from '../shared/infrastructure/hydration-sdk.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    HydrationSdkService,
    { provide: UserRepository, useClass: UserRepositoryImplement },
  ],
})
export class UsersModule {}
