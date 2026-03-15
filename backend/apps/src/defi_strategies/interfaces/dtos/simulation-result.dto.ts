import { ApiProperty } from '@nestjs/swagger';

export class TokenInfoDto {
  @ApiProperty()
  asset_id: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  amount: number;
}

export class SimulationStepDto {
  @ApiProperty()
  step_index: number;

  @ApiProperty()
  action_type: string;

  @ApiProperty()
  agent: string;

  @ApiProperty({ type: TokenInfoDto })
  token_in: TokenInfoDto;

  @ApiProperty({ type: TokenInfoDto })
  token_out: TokenInfoDto;

  @ApiProperty()
  fee: number;

  @ApiProperty({ required: false })
  slippage?: number;

  @ApiProperty({ required: false })
  price_impact?: number;

  @ApiProperty({ required: false })
  apy?: number;

  @ApiProperty()
  execution_time: string;
}

export class SimulationResultDto {
  @ApiProperty()
  strategy_id: string;

  @ApiProperty()
  simulation_id: string;

  @ApiProperty()
  input_amount: number;

  @ApiProperty()
  final_amount: number;

  @ApiProperty()
  total_fee: number;

  @ApiProperty()
  estimated_slippage: number;

  @ApiProperty()
  estimated_duration: string;

  @ApiProperty({ type: [SimulationStepDto] })
  steps: SimulationStepDto[];

  @ApiProperty({ type: [String] })
  warnings: string[];

  @ApiProperty()
  simulated_at: Date;
}
