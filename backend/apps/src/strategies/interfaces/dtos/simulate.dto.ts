import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ example: 'ASSET_1' })
  assetId: string;

  @ApiProperty({ example: 'SYM' })
  symbol: string;

  @ApiProperty({ example: 1000, required: false })
  amount?: number;
}

export class StepDto {
  @ApiProperty({ example: 1 })
  step: number;

  @ApiProperty({ example: 'BORROW' })
  type: string;

  @ApiProperty({ example: 'AGENT_A', required: false })
  agent?: string;

  @ApiProperty({ type: TokenDto, required: false })
  tokenIn?: TokenDto;

  @ApiProperty({ type: TokenDto, required: false })
  tokenOut?: TokenDto;
}

export class SimulateResultDto {
  @ApiProperty({ type: TokenDto })
  initialCapital: TokenDto;

  @ApiProperty({ example: 1 })
  loops: number;

  @ApiProperty({ example: 0 })
  fee: number;

  @ApiProperty({ example: 0 })
  totalSupply: number;

  @ApiProperty({ example: 0 })
  totalBorrow: number;

  @ApiProperty({ type: [StepDto] })
  steps: StepDto[];
}