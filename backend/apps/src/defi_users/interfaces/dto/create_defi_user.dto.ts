import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDefiUserDto {
    @ApiProperty({ description: 'The wallet address of the DeFi user' })
    @IsString()
    wallet_address: string;

    @ApiProperty({ description: 'The type of the wallet (e.g., MetaMask, Trust Wallet)' })
    @IsString()
    wallet_type: string;
}