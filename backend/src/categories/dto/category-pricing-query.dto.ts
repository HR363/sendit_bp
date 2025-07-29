import { IsNumber } from 'class-validator';

export class CategoryPricingQueryDto {
  @IsNumber()
  weight: number;
} 