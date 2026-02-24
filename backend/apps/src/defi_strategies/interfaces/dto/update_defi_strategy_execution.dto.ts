import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateDefiStrategyExecutionDto {
  @ApiProperty({ example: "0xdeadbeef", required: false })
  @IsOptional()
  @IsString()
  extrinsic_hash?: string;

  @ApiProperty({ example: "SUCCESS", required: false })
  @IsOptional()
  @IsString()
  execution_status?: string;
}
