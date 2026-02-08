import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDefiModuleActionRiskDto {
    @ApiProperty({ description: 'Type of risk associated with the action' })
    @IsString()
    risk_type: string;

    @ApiProperty({ description: 'Severity level of the risk' })
    @IsString()
    severity: string;

    @ApiProperty({ description: 'Detailed description of the risk' })
    @IsString()
    description: string;
}