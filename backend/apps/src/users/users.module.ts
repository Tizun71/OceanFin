import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './interfaces/user.controller';
import { UserRepository } from './domain/user.repository';
import { UserRepositoryImplement } from './infrastructure/user.repository.impl';
import { DatabaseModule } from '../shared/database.module';
import { HydrationSdkService } from '../shared/infrastructure/hydration-sdk.service';
import { WalletSignatureVerifier } from './application/wallet-signature.verifier';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    HydrationSdkService,
    WalletSignatureVerifier,
    { provide: UserRepository, useClass: UserRepositoryImplement },
  ],
  exports: [UserService],
})
export class UsersModule {}
