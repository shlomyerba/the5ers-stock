import { Controller, Get, Param, Query } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('api/stocks')
export class StocksController {
  constructor(private service: StocksService) {}

  @Get(':symbol/quote')
  quote(@Param('symbol') symbol: string) {
    return this.service.quote(symbol);
  }

  @Get('quotes')
  quotes(@Query('symbols') symbolsCsv: string) {
    const symbols = (symbolsCsv || '')
      .split(',')
      .map((s) => s.toUpperCase().trim())
      .filter(Boolean);
    return this.service.quotes(symbols);
  }
}