import { IsString, IsNumber, IsPositive, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OperationType } from '../../domain/operation-type.enum';

export class EstimateDefiPairDto {
  @ApiProperty({
    description: 'Type of operation',
    enum: OperationType,
    example: OperationType.SWAP,
  })
  @IsEnum(OperationType)
  operation_type: OperationType;

  @ApiProperty({
    description: 'ID of the input token (for SWAP/SUPPLY) or collateral token (for BORROW)',
    example: 'token-uuid-5678',
  })
  @IsString()
  token_in_id: string;

  @ApiProperty({
    description: 'ID of the output token (for SWAP) or borrow token (for BORROW). Not required for SUPPLY.',
    example: 'token-uuid-91011',
    required: false,
  })
  @IsString()
  @IsOptional()
  token_out_id?: string;

  @ApiProperty({
    description: 'Amount of input token (in human-readable format)',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  amount_in: number;
}
