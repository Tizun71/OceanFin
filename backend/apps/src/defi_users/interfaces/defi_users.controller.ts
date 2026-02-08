import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DefiUsersService } from "../application/defi_users.service";
import { CreateDefiUserDto } from "./dto/create_defi_user.dto";
import { ApiBody } from "@nestjs/swagger";

@Controller('defi-users')
export class DefiUsersController {
    constructor(private readonly defiUsersService: DefiUsersService) { }

    @Post()
    @ApiBody({ type: CreateDefiUserDto })
    async createDefiUser(@Body() body: CreateDefiUserDto) {
        return this.defiUsersService.createDefiUser(body);
    }

    @Get(':wallet_address')
    async getDefiUserByWalletAddress(@Param('wallet_address') wallet_address: string) {
        return this.defiUsersService.getDefiUserByWalletAddress(wallet_address);
    }
}