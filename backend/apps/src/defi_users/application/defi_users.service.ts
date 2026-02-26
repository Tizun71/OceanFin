import { Injectable, NotFoundException } from '@nestjs/common';
import { DefiUsersRepository } from '../domain/defi_users.repository';
import { DefiUser } from '../domain/defi_user.entity';
import { CreateDefiUserDto } from '../interfaces/dto/create_defi_user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DefiUsersService {
  constructor(private readonly defiUsersRepository: DefiUsersRepository) {}

  async createDefiUser(
    createDefiUserDto: CreateDefiUserDto,
  ): Promise<DefiUser> {
    const defiUser = new DefiUser(
      uuidv4(),
      createDefiUserDto.wallet_address,
      createDefiUserDto.wallet_type,
      new Date(),
    );
    return this.defiUsersRepository.createDefiUser(defiUser);
  }

  async getDefiUserByWalletAddress(
    wallet_address: string,
  ): Promise<DefiUser | null> {
    const defiUser =
      await this.defiUsersRepository.getDefiUserByWalletAddress(wallet_address);

    if (!defiUser) {
      throw new NotFoundException(
        `DefiUser with wallet address ${wallet_address} not found`,
      );
    }

    return defiUser;
  }

  async getDefiUserById(id: string): Promise<DefiUser> {
    const defiUser = await this.defiUsersRepository.getDefiUserById(id);

    if (!defiUser) {
      throw new NotFoundException(`DefiUser with id ${id} not found`);
    }

    return defiUser;
  }
}
