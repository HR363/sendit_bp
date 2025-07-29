import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../common/database/prisma.service';
import { MailService } from '../common/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly mailService;
    constructor(jwtService: JwtService, prisma: PrismaService, mailService: MailService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            isActive: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        note: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        id: string;
        role: string;
        createdAt: Date;
        isEmailVerified: boolean;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        message: string;
        note: string;
    }>;
    forgotPassword({ email }: ForgotPasswordDto): Promise<void>;
    resetPassword({ email, code, newPassword }: ResetPasswordDto): Promise<void>;
}
