import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './interfaces/user.controller';
import { UserRepository } from './domain/user.repository';
import { UserRepositoryImplement } from './infrastructure/user.repository.impl';
import { SupabaseModule } from '../shared/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: UserRepository, useClass: UserRepositoryImplement },
  ],
})
export class UsersModule {}
