import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  deletedAt?: Date;

  @IsOptional()
  @IsString()
  role?: string; // 'USER', 'ADMIN', 'COURIER_AGENT'
} 