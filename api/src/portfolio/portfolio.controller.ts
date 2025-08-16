import { Body, Controller, Get, Put } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { SetPortfolioDto } from './portfolio.dto';

@Controller('api/portfolio')
export class PortfolioController {
  constructor(private service: PortfolioService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Put()
  set(@Body() body: SetPortfolioDto) {
    const symbols = (body.symbols || [])
      .map((s) => String(s).toUpperCase().trim())
      .filter(Boolean);
    return this.service.set(symbols);
  }
}
