import { ArrayNotEmpty, IsArray, IsString, Matches } from 'class-validator';

export class SetPortfolioDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^[A-Z0-9.\-]{1,10}$/, { each: true })
  symbols!: string[];
}
