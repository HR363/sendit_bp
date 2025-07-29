import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../common/mail.service';
interface RequestWithUser extends Request {
    user: any;
}
export declare class AuthController {
    private readonly authService;
    private readonly mailService;
    constructor(authService: AuthService, mailService: MailService);
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
    login(loginDto: LoginDto): Promise<{
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
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerification(resendVerificationDto: ResendVerificationDto): Promise<{
        message: string;
        note: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(req: RequestWithUser): any;
    testWelcomeEmail(body: {
        email: string;
        firstName: string;
    }): Promise<{
        message: string;
        error?: undefined;
    } | {
        error: any;
        message?: undefined;
    }>;
}
export {};
