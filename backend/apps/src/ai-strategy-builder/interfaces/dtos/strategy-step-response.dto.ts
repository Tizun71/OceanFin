import { ApiProperty } from '@nestjs/swagger';

class TokenInfo {
  @ApiProperty({ example: '5', description: 'Asset ID on Hydration' })
  assetId: string;

  @ApiProperty({ example: 'DOT', description: 'Token symbol' })
  symbol: string;

  @ApiProperty({ example: 0.01, description: 'Token amount' })
  amount: number;
}

export class StrategyStepResponseDto {
  @ApiProperty({ example: 1, description: 'Step number in sequence' })
  step: number;

  @ApiProperty({
    example: 'SWAP',
    description: 'Operation type',
    enum: [
      'SWAP',
      'SUPPLY',
      'BORROW',
      'JOIN_STRATEGY',
      'ENABLE_E_MODE',
      'BRIDGE',
      'STAKE',
      'UNSTAKE',
      'CLAIM_REWARDS',
    ],
  })
  type: string;

  @ApiProperty({ example: 'HYDRATION', description: 'DeFi protocol/agent' })
  agent: string;

  @ApiProperty({
    type: TokenInfo,
    required: false,
    description: 'Input token details',
  })
  tokenIn?: TokenInfo;

  @ApiProperty({
    type: TokenInfo,
    required: false,
    description: 'Output token details',
  })
  tokenOut?: TokenInfo;
}
