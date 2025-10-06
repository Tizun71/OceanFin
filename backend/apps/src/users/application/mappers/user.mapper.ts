import { plainToInstance } from 'class-transformer';
import { User } from 'src/users/domain/user.entity';
import { CreateUserDto } from 'src/users/interfaces/dtos/create-user.dto';
import { UserDto } from 'src/users/interfaces/dtos/user.dto';
import { UserResponseDto } from 'src/users/interfaces/dtos/user-response.dto';

export class UserMapper {
  static toDto(user: User): UserDto {
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static toResponse(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static toResponseList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toResponse(user));
  }

  static toEntity(id: string, dto: CreateUserDto): User {
    return new User(id, dto.walletAddress, dto.chainId, dto.username);
  }
}
