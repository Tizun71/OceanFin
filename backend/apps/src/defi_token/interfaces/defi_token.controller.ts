import { Controller, Body, Post } from '@nestjs/common';
import { DefiTokenService } from '../application/defi_token.service';
import { CreateDefiTokenDto } from './dto/create_defi_token.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('defi-token')
export class DefiTokenController {
  constructor(private readonly defiTokenService: DefiTokenService) {}

  @ApiOperation({ summary: 'Create a new DeFi token' })
  @Post()
  async createDefiToken(@Body() body: CreateDefiTokenDto) {
    return this.defiTokenService.createDefiToken(body);
  }
}
