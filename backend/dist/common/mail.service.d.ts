import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    sendVerificationEmail(email: string, code: string): Promise<void>;
    sendPasswordResetEmail(email: string, code: string): Promise<void>;
    sendWelcomeEmail(email: string, firstName: string): Promise<void>;
    sendStatusUpdateEmail(email: string, name: string, trackingNumber: string, status: string): Promise<void>;
    sendDeliveryConfirmationEmail(email: string, name: string, trackingNumber: string): Promise<void>;
}
