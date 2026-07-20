import { Controller, Body, Get, Post, Query } from '@nestjs/common';
import { DefiTokenService } from '../application/defi_token.service';
import { CreateDefiTokenDto } from './dto/create_defi_token.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('defi-token')
export class DefiTokenController {
  constructor(private readonly defiTokenService: DefiTokenService) {}

  @ApiOperation({ summary: 'Create a new DeFi token' })
  @Post()
  async createDefiToken(@Body() body: CreateDefiTokenDto) {
    return this.defiTokenService.createDefiToken(body);
  }

  @ApiOperation({
    summary:
      'List DeFi tokens. EVM entries carry address + decimals, which the client needs to resolve a strategy input token.',
  })
  @ApiQuery({
    name: 'chain',
    required: false,
    description: "Filter by chain slug ('polkadot' | 'avalanche' | 'base' | 'arbitrum')",
  })
  @Get()
  async getDefiTokens(@Query('chain') chain?: string) {
    return this.defiTokenService.getAllDefiTokens(chain);
  }
}
