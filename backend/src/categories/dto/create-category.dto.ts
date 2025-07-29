import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  minWeight: number;

  @IsNumber()
  maxWeight: number;

  @IsNumber()
  pricePerKg: number;

  @IsNumber()
  basePrice: number;
} 