import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  minWeight?: number;

  @IsOptional()
  @IsNumber()
  maxWeight?: number;

  @IsOptional()
  @IsNumber()
  pricePerKg?: number;

  @IsOptional()
  @IsNumber()
  basePrice?: number;
} 