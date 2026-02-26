import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDefiPairsDto {
  @ApiProperty({
    description: "ID of the DeFi module action",
    example: "action-uuid-1234",
  })
  @IsString()
  action_id: string;

  @ApiProperty({
    description: "ID of the input token",
    example: "token-uuid-5678",
  })
  @IsString()
  @IsOptional()
  token_in_id?: string;

  @ApiProperty({
    description: "ID of the output token",
    example: "token-uuid-91011",
  })
  @IsString()
  @IsOptional()
  token_out_id?: string;
}
