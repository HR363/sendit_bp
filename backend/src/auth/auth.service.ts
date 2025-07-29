import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../common/database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import { MailService } from '../common/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UnauthorizedException } from '@nestjs/common';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // Placeholder for user validation logic
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) return null;
    // TODO: Temporarily disabled for testing - re-enable email verification
    // if (!user.isEmailVerified) {
    //   throw new UnauthorizedException('Email not verified. Please verify your email before logging in.');
    // }
    // Omit password from returned user
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check for duplicate email
    const existingEmail = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
    if (existingEmail) {
      throw new BadRequestException('Email already in use');
    }
    // Check for duplicate phone
    const existingPhone = await this.prisma.user.findUnique({ where: { phone: registerDto.phone } });
    if (existingPhone) {
      throw new BadRequestException('Phone number already in use');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // Generate verification code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiry = addMinutes(new Date(), 15);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: 'USER',
        isEmailVerified: false,
        emailVerificationCode: code,
        emailVerificationExpiry: expiry,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        isEmailVerified: true,
      },
    });
    
    // Send verification email (will not throw error if it fails)
    await this.mailService.sendVerificationEmail(user.email, code);
    
    // Send welcome email (will not throw error if it fails)
    await this.mailService.sendWelcomeEmail(user.email, user.firstName);
    
    return {
      ...user,
      message: 'Registration successful. Please check your email for verification code.',
      note: 'If you don\'t receive the email, check the server logs for the verification code during development.'
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified) throw new BadRequestException('Email already verified');
    if (!user.emailVerificationCode || !user.emailVerificationExpiry) throw new BadRequestException('No verification code found');
    if (user.emailVerificationCode !== dto.code) throw new BadRequestException('Invalid verification code');
    if (user.emailVerificationExpiry < new Date()) throw new BadRequestException('Verification code expired');
    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiry: null,
      },
    });
    return { message: 'Email verified successfully' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified) throw new BadRequestException('Email already verified');
    // Generate new code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = addMinutes(new Date(), 15);
    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        emailVerificationCode: code,
        emailVerificationExpiry: expiry,
      },
    });
    // Send verification email (will not throw error if it fails)
    await this.mailService.sendVerificationEmail(user.email, code);
    return { 
      message: 'Verification code resent. Please check your email.',
      note: 'If you don\'t receive the email, check the server logs for the verification code during development.'
    };
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email, isActive: true } });
    if (!user || !user.isEmailVerified) throw new BadRequestException('User not found or not verified');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetCode: code, passwordResetExpiry: expiry },
    });
    // Send password reset email (will not throw error if it fails)
    await this.mailService.sendPasswordResetEmail(email, code);
  }

  async resetPassword({ email, code, newPassword }: ResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email, isActive: true } });
    if (!user || !user.passwordResetCode || !user.passwordResetExpiry) throw new BadRequestException('Invalid or expired reset code');
    if (user.passwordResetCode !== code) throw new BadRequestException('Invalid reset code');
    if (user.passwordResetExpiry < new Date()) throw new BadRequestException('Reset code expired');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordResetCode: null, passwordResetExpiry: null },
    });
  }
}
