import { ApiProperty } from '@nestjs/swagger';
import { OperationType } from '../../domain/operation-type.enum';

export class EstimateDefiPairResponseDto {
  @ApiProperty({
    description: 'Type of operation',
    enum: OperationType,
    example: OperationType.SWAP,
  })
  operation_type: OperationType;

  @ApiProperty({
    description: 'Estimated amount of output token (for SWAP/BORROW)',
    example: 95.5,
    required: false,
  })
  amount_out?: number;

  @ApiProperty({
    description: 'Input token ID',
    example: 'token-uuid-5678',
  })
  token_in_id: string;

  @ApiProperty({
    description: 'Output token ID',
    example: 'token-uuid-91011',
    required: false,
  })
  token_out_id?: string;

  @ApiProperty({
    description: 'Input amount',
    example: 100,
  })
  amount_in: number;

  @ApiProperty({
    description: 'Estimated fee (if applicable)',
    example: 0.3,
    required: false,
  })
  fee?: number;

  @ApiProperty({
    description: 'Slippage percentage (for SWAP)',
    example: 0.01,
    required: false,
  })
  slippage?: number;

  @ApiProperty({
    description: 'Supply APY percentage (for SUPPLY)',
    example: 5.25,
    required: false,
  })
  supply_apy?: number;

  @ApiProperty({
    description: 'Borrow APY percentage (for BORROW)',
    example: 8.5,
    required: false,
  })
  borrow_apy?: number;

  @ApiProperty({
    description: 'Maximum amount that can be borrowed (for BORROW)',
    example: 75.5,
    required: false,
  })
  max_borrow_amount?: number;

  @ApiProperty({
    description: 'Health factor after operation (for BORROW)',
    example: 1.25,
    required: false,
  })
  health_factor?: number;

  @ApiProperty({
    description: 'Loan-to-Value ratio (for BORROW)',
    example: 0.75,
    required: false,
  })
  ltv?: number;

  @ApiProperty({
    description: 'Liquidation threshold (for BORROW)',
    example: 0.80,
    required: false,
  })
  liquidation_threshold?: number;
}
