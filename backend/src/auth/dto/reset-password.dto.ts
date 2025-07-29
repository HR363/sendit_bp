import { IsEmail, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;

  @IsString()
  @Length(8, 64)
  newPassword: string;
} 