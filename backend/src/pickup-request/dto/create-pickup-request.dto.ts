import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePickupRequestDto {
  @IsString()
  @IsNotEmpty()
  parcelDetails: string; // JSON string with parcel info

  @IsString()
  @IsNotEmpty()
  pickupLocation: string; // JSON string or address

  @IsOptional()
  @IsString()
  assignedCourierId?: string;
} 