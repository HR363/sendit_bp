import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your SendIt account',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <b>${code}</b></p>`,
      });
      this.logger.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
      this.logger.log(`DEVELOPMENT: Verification code for ${email} is: ${code}`);
      // Don't throw the error - let the registration continue
      // The user can still verify manually using the logged code
    }
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your SendIt password',
        template: 'forgot-password', // relative to backend/templates
        context: { code },
      });
      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
      this.logger.log(`DEVELOPMENT: Password reset code for ${email} is: ${code}`);
      // Don't throw the error - let the process continue
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      this.logger.log(`Attempting to send welcome email to ${email} with firstName: ${firstName}`);
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to SendIt!',
        template: 'welcome', // relative to backend/templates
        context: { 
          firstName: firstName 
        },
      });
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}: ${error.message}`);
      this.logger.error(`Welcome email error details: ${JSON.stringify(error, null, 2)}`);
      // Don't throw the error - welcome email is not critical
    }
  }

  async sendStatusUpdateEmail(email: string, name: string, trackingNumber: string, status: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Parcel Status Update',
        template: 'status-update',
        context: { name, trackingNumber, status },
      });
      this.logger.log(`Status update email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send status update email to ${email}: ${error.message}`);
      // Don't throw the error - status update email is not critical
    }
  }

  async sendDeliveryConfirmationEmail(email: string, name: string, trackingNumber: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Delivery Confirmation',
        template: 'delivery-confirmation',
        context: { name, trackingNumber },
      });
      this.logger.log(`Delivery confirmation email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send delivery confirmation email to ${email}: ${error.message}`);
      // Don't throw the error - delivery confirmation email is not critical
    }
  }
} 