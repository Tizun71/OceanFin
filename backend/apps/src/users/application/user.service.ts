import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../interfaces/dtos/create-user.dto';
import { HydrationSdkService } from '../../shared/infrastructure/hydration-sdk.service';
import { WalletSignatureVerifier } from './wallet-signature.verifier';
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hydrationSdk: HydrationSdkService,
    private readonly signatureVerifier: WalletSignatureVerifier,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // Proof of wallet ownership. Without this, anyone could register an
    // account against someone else's address and take it over.
    this.signatureVerifier.verify(dto.walletAddress, dto.issuedAt, dto.signature);

    const existing = await this.userRepo.findByWalletAddress(dto.walletAddress);
    if (existing) {
      throw new ConflictException('An account already exists for this wallet address');
    }

    const id = this.generateId();
    const user = new User(id, dto.walletAddress, dto.chainId, dto.username);
    await this.userRepo.save(user);
    return user;
  }

  private generateId(): string {
    return uuidv4();
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async listUsers(): Promise<User[]> {
    return await this.userRepo.findAll();
  }

  async renameUsername(id: string, newUsername: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.changeUsername(newUsername);
    await this.userRepo.save(user);
    return user;
  }

  async checkEvmBinding(substrateAddress: string): Promise<{ isBound: boolean; evmAddress: string }> {
    return this.hydrationSdk.checkEvmBinding(substrateAddress);
  }

  async getUserTokenBalance(account: string, tokenId: string): Promise<number> {
    return this.hydrationSdk.getTokenBalance(account, tokenId);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User> {
    const user = await this.userRepo.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
