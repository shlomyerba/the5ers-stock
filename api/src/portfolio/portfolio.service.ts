import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Portfolio, PortfolioDocument } from './portfolio.schema';

const SINGLE_ID = 'default-portfolio-id';

@Injectable()
export class PortfolioService {
  constructor(@InjectModel(Portfolio.name) private model: Model<PortfolioDocument>) {}

  async get() {
    let doc = await this.model.findById(SINGLE_ID).lean();
    if (!doc) {
      const created = await this.model.create({ _id: SINGLE_ID, symbols: [] });
      return { symbols: created.symbols };
    }
    return { symbols: doc.symbols ?? [] };
  }

  async set(symbols: string[]) {
    await this.model.findByIdAndUpdate(
      SINGLE_ID,
      { symbols },
      { upsert: true, new: true }
    );
    return { symbols };
  }
}