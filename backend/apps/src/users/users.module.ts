import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './interfaces/user.controller';
import { UserRepository } from './domain/user.repository';
import { ImplementUserRepository } from './infrastructure/user.repository.impl';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: UserRepository, useClass: ImplementUserRepository },
  ],
})
export class UsersModule {}
