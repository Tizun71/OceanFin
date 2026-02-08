import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DefiUsersService } from "../application/defi_users.service";
import { CreateDefiUserDto } from "./dto/create_defi_user.dto";
import { ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger";

@Controller('defi-users')
export class DefiUsersController {
    constructor(private readonly defiUsersService: DefiUsersService) { }

    @Post()
    @ApiBody({ type: CreateDefiUserDto })
    @ApiOperation({ summary: 'Create a new DeFi user' })
    async createDefiUser(@Body() body: CreateDefiUserDto) {
        return this.defiUsersService.createDefiUser(body);
    }

    @Get(':wallet_address')
    @ApiOperation({ summary: 'Get DeFi user by wallet address' })
    @ApiParam({ name: 'wallet_address', description: 'The wallet address of the DeFi user' })
    async getDefiUserByWalletAddress(@Param('wallet_address') wallet_address: string) {
        return this.defiUsersService.getDefiUserByWalletAddress(wallet_address);
    }
}