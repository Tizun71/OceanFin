import { Controller, Get, Param, Post, Body, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ActivityService } from '../application/activity.service';
import { ActivityResponseDto } from './dtos/activity-response.dto';
import { ActivityMapper } from '../application/mappers/activity.mapper';
import { UpdateActivityProgressDto } from './dtos/update-activity-progress.dto';
import { CreateActivityDto } from './dtos/create-activity.dto';

@ApiTags('Activities')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all transaction history (activities)' })
  @ApiResponse({
    status: 200,
    description: 'List of all activities',
    type: [ActivityResponseDto],
  })
  async findAll(): Promise<ActivityResponseDto[]> {
    const activities = await this.activityService.findAll();
    return ActivityMapper.toResponseList(activities);
  }

  @Get()
  @ApiOperation({ summary: 'Get activities (filter by strategyId or userAddress)' })
  @ApiQuery({ name: 'strategyId', required: false, description: 'Strategy ID' })
  @ApiQuery({ name: 'userAddress', required: false, description: 'Wallet address of user' })
  async find(
    @Query('strategyId') strategyId?: string,
    @Query('userAddress') userAddress?: string,
  ): Promise<ActivityResponseDto[]> {
    const activities = await this.activityService.find(strategyId, userAddress);
    return ActivityMapper.toResponseList(activities);
  }



 @Post()
@ApiOperation({ summary: 'Create new activity' })
@ApiResponse({ status: 201, description: 'Activity created', type: ActivityResponseDto })
async createActivity(@Body() dto: CreateActivityDto): Promise<ActivityResponseDto> {
  const activity = await this.activityService.create(dto);
  return ActivityMapper.toResponse(activity);
}


  @Put('progress/:id')
  @ApiOperation({ summary: 'Resume or continue activity progress from a failed step' })
  @ApiResponse({ status: 200, description: 'Progress updated', type: ActivityResponseDto })
  async resumeProgress(
    @Body() dto: UpdateActivityProgressDto,
  ): Promise<ActivityResponseDto> {
    const merged = { ...dto};
    const updated = await this.activityService.updateProgress(merged);
    return ActivityMapper.toResponse(updated);
  }


}

