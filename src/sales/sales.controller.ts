import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get('stats/daily-totals')
  getDailySalesTotal() {
    return this.salesService.getDailySalesTotal();
  }

  @Get('stats/top-clients')
  getTopClientsStats() {
    return this.salesService.getTopClientsStats();
  }
}
