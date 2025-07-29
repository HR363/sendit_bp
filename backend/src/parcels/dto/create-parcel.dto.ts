import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateParcelDto {
  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  senderName: string;

  @IsString()
  @IsNotEmpty()
  senderPhone: string;

  @IsString()
  @IsNotEmpty()
  senderEmail: string;

  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  receiverPhone: string;

  @IsString()
  @IsNotEmpty()
  receiverEmail: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string; // JSON string

  @IsString()
  @IsNotEmpty()
  destinationLocation: string; // JSON string

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  estimatedDeliveryDate: string;

  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;

  @IsOptional()
  @IsString()
  serviceType?: 'Standard' | 'Express' | 'Overnight';

  @IsOptional()
  @IsNumber()
  price?: number;
} 