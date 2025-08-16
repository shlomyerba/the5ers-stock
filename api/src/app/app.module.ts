// apps/api/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { StocksModule } from '../stocks/stocks.module';
import { HealthController } from '../health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    PortfolioModule,
    StocksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}