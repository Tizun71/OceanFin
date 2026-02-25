import { Module } from '@nestjs/common';
import { DefiUsersService } from './application/defi_users.service';
import { DefiUsersRepositoryImplement } from './infrastructure/defi_users.repository.impl';
import { DefiUsersRepository } from './domain/defi_users.repository';
import { DefiUsersController } from './interfaces/defi_users.controller';
import { SupabaseModule } from '../shared/supabase.module';

@Module({
  controllers: [DefiUsersController],
  providers: [
    DefiUsersService,
    {
      provide: DefiUsersRepository,
      useClass: DefiUsersRepositoryImplement,
    },
  ],
  exports: [DefiUsersService],
  imports: [SupabaseModule],
})
export class DefiUsersModule {}
