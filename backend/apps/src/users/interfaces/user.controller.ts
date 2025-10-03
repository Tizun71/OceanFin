import { 
  Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from '../application/user.service';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUsernameDto } from './dtos/update-username.dto';
import { UserMapper } from '../application/mappers/user.mapper';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(dto);
    return UserMapper.toResponse(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.getUser(id);
    return UserMapper.toResponse(user);
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  async listUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.listUsers();
    return UserMapper.toResponseList(users);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update the username of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Username updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  async renameUsername(
    @Param('id') id: string,
    @Body() updateDto: UpdateUsernameDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.renameUsername(id, updateDto.username);
    return UserMapper.toResponse(user);
  }
}
