import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../interfaces/dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const id = this.generateId();
    const user = new User(id, dto.walletAddress, dto.chainId, dto.username);
    await this.userRepo.save(user);
    return user;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
}
