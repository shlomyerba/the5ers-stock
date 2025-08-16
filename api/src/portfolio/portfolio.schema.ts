import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Portfolio {
  @Prop({ type: String, default: 'default-portfolio-id' })
  _id!: string;

  @Prop({ type: [String], default: [] })
  symbols!: string[];
}
export type PortfolioDocument = Portfolio & Document;
export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);