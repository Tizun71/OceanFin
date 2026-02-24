import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString } from "class-validator";

export class CreateDefiStrategyVersionDto {
  @ApiProperty({
    description: "ID of the parent strategy",
    example: "uuid-strategy-id",
  })
  @IsString()
  strategy_id: string;

  @ApiProperty({ description: "Workflow JSON describing the strategy" })
  @IsObject()
  workflow_json: object;

  @ApiProperty({
    description: "The state from react-flow to restore the graph UI",
  })
  @IsObject()
  workflow_graph: object;
}
