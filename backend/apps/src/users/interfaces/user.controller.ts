import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { UserResponseDto } from './dtos/user-response.dto';
import { UpdateUsernameDto } from './dtos/update-username.dto';
import { UserMapper } from '../application/mappers/user.mapper';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(dto);
    return UserMapper.toResponse(user);
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.getUser(id);
    return UserMapper.toResponse(user);
  }

  @Get()
  async listUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.listUsers();
    return UserMapper.toResponseList(users);
  }

  @Put(':id')
  async renameUsername(
    @Param('id') id: string, 
    @Body() updateDto: UpdateUsernameDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.renameUsername(id, updateDto.username);
    return UserMapper.toResponse(user);
  }
}
