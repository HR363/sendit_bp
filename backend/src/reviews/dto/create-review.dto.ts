import { IsInt, Min, Max, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  @IsNotEmpty()
  parcelId: string;
} 