import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateActivityProgressDto {
	@ApiProperty({ description: 'Activity ID (UUID)' })
	@IsUUID()
	activityId: string;

	@ApiProperty({ description: 'Current step (1..8)', minimum: 1 })
	@IsInt()
	@Min(1)
	step: number;

	@ApiProperty({ description: 'Progress status', enum: ['PENDING', 'FAILED', 'SUCCESS'] })
	@IsIn(['PENDING', 'FAILED', 'SUCCESS'])
	status: 'PENDING' | 'FAILED' | 'SUCCESS';

	@ApiPropertyOptional({ description: 'Optional message for this step' })
	@IsOptional()
	@IsString()
	message?: string;
}
