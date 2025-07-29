import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateParcelDto {
  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsString()
  senderPhone?: string;

  @IsOptional()
  @IsString()
  senderEmail?: string;

  @IsOptional()
  @IsString()
  receiverName?: string;

  @IsOptional()
  @IsString()
  receiverPhone?: string;

  @IsOptional()
  @IsString()
  receiverEmail?: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  destinationLocation?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
} 