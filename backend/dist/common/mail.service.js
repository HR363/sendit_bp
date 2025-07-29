"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let MailService = MailService_1 = class MailService {
    mailerService;
    logger = new common_1.Logger(MailService_1.name);
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    async sendVerificationEmail(email, code) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Verify your SendIt account',
                text: `Your verification code is: ${code}`,
                html: `<p>Your verification code is: <b>${code}</b></p>`,
            });
            this.logger.log(`Verification email sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
            this.logger.log(`DEVELOPMENT: Verification code for ${email} is: ${code}`);
        }
    }
    async sendPasswordResetEmail(email, code) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Reset your SendIt password',
                template: 'forgot-password',
                context: { code },
            });
            this.logger.log(`Password reset email sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
            this.logger.log(`DEVELOPMENT: Password reset code for ${email} is: ${code}`);
        }
    }
    async sendWelcomeEmail(email, firstName) {
        try {
            this.logger.log(`Attempting to send welcome email to ${email} with firstName: ${firstName}`);
            await this.mailerService.sendMail({
                to: email,
                subject: 'Welcome to SendIt!',
                template: 'welcome',
                context: {
                    firstName: firstName
                },
            });
            this.logger.log(`Welcome email sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}: ${error.message}`);
            this.logger.error(`Welcome email error details: ${JSON.stringify(error, null, 2)}`);
        }
    }
    async sendStatusUpdateEmail(email, name, trackingNumber, status) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Parcel Status Update',
                template: 'status-update',
                context: { name, trackingNumber, status },
            });
            this.logger.log(`Status update email sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send status update email to ${email}: ${error.message}`);
        }
    }
    async sendDeliveryConfirmationEmail(email, name, trackingNumber) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Delivery Confirmation',
                template: 'delivery-confirmation',
                context: { name, trackingNumber },
            });
            this.logger.log(`Delivery confirmation email sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send delivery confirmation email to ${email}: ${error.message}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map