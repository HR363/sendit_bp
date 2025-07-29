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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../common/database/prisma.service");
const common_2 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const mail_service_1 = require("../common/mail.service");
let AuthService = class AuthService {
    jwtService;
    prisma;
    mailService;
    constructor(jwtService, prisma, mailService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return null;
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch)
            return null;
        const { password, ...result } = user;
        return result;
    }
    async login(user) {
        const payload = { sub: user.id, email: user.email };
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
    async register(registerDto) {
        const existingEmail = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
        if (existingEmail) {
            throw new common_2.BadRequestException('Email already in use');
        }
        const existingPhone = await this.prisma.user.findUnique({ where: { phone: registerDto.phone } });
        if (existingPhone) {
            throw new common_2.BadRequestException('Phone number already in use');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = (0, date_fns_1.addMinutes)(new Date(), 15);
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
        await this.mailService.sendVerificationEmail(user.email, code);
        await this.mailService.sendWelcomeEmail(user.email, user.firstName);
        return {
            ...user,
            message: 'Registration successful. Please check your email for verification code.',
            note: 'If you don\'t receive the email, check the server logs for the verification code during development.'
        };
    }
    async verifyEmail(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_2.BadRequestException('User not found');
        if (user.isEmailVerified)
            throw new common_2.BadRequestException('Email already verified');
        if (!user.emailVerificationCode || !user.emailVerificationExpiry)
            throw new common_2.BadRequestException('No verification code found');
        if (user.emailVerificationCode !== dto.code)
            throw new common_2.BadRequestException('Invalid verification code');
        if (user.emailVerificationExpiry < new Date())
            throw new common_2.BadRequestException('Verification code expired');
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
    async resendVerification(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_2.BadRequestException('User not found');
        if (user.isEmailVerified)
            throw new common_2.BadRequestException('Email already verified');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = (0, date_fns_1.addMinutes)(new Date(), 15);
        await this.prisma.user.update({
            where: { email: dto.email },
            data: {
                emailVerificationCode: code,
                emailVerificationExpiry: expiry,
            },
        });
        await this.mailService.sendVerificationEmail(user.email, code);
        return {
            message: 'Verification code resent. Please check your email.',
            note: 'If you don\'t receive the email, check the server logs for the verification code during development.'
        };
    }
    async forgotPassword({ email }) {
        const user = await this.prisma.user.findUnique({ where: { email, isActive: true } });
        if (!user || !user.isEmailVerified)
            throw new common_2.BadRequestException('User not found or not verified');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordResetCode: code, passwordResetExpiry: expiry },
        });
        await this.mailService.sendPasswordResetEmail(email, code);
    }
    async resetPassword({ email, code, newPassword }) {
        const user = await this.prisma.user.findUnique({ where: { email, isActive: true } });
        if (!user || !user.passwordResetCode || !user.passwordResetExpiry)
            throw new common_2.BadRequestException('Invalid or expired reset code');
        if (user.passwordResetCode !== code)
            throw new common_2.BadRequestException('Invalid reset code');
        if (user.passwordResetExpiry < new Date())
            throw new common_2.BadRequestException('Reset code expired');
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashed, passwordResetCode: null, passwordResetExpiry: null },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map