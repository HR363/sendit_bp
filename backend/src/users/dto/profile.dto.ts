import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';

export class UserProfileResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  profilePhoto?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  profilePhoto?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}