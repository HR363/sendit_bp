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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/database/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, isActive: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { id, email, firstName, lastName, phone, role, profilePhoto, isActive, createdAt, updatedAt } = user;
        return { id, email, firstName, lastName, phone, role, profilePhoto: profilePhoto || undefined, isActive, createdAt, updatedAt };
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId, isActive: true },
            data: { ...dto },
        });
        const { id, email, firstName, lastName, phone, role, profilePhoto, isActive, createdAt, updatedAt } = user;
        return { id, email, firstName, lastName, phone, role, profilePhoto: profilePhoto || undefined, isActive, createdAt, updatedAt };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, isActive: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return { message: 'Password changed successfully' };
    }
    async listUsers() {
        const users = await this.prisma.user.findMany({ where: {}, orderBy: { createdAt: 'desc' } });
        return users.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            profilePhoto: user.profilePhoto || undefined,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
    }
    async updateUserStatus(id, dto, currentAdminId) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isDemotingAdmin = user.role === 'ADMIN' && dto.role && dto.role !== 'ADMIN';
        const isDeactivatingAdmin = user.role === 'ADMIN' && dto.isActive === false;
        if (isDemotingAdmin || isDeactivatingAdmin) {
            const activeAdmins = await this.prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
            if (activeAdmins <= 1) {
                throw new common_1.ForbiddenException('Cannot demote or deactivate the last remaining admin');
            }
        }
        if (currentAdminId && id === currentAdminId) {
            if ((dto.role && dto.role !== 'ADMIN') || dto.isActive === false) {
                throw new common_1.ForbiddenException('Admins cannot demote or deactivate themselves');
            }
        }
        const updateData = { ...dto, deletedAt: dto.isActive === false ? new Date() : null };
        if (dto.role) {
            updateData.role = dto.role;
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        const { email, firstName, lastName, phone, role, isActive, createdAt, updatedAt } = updatedUser;
        return { id, email, firstName, lastName, phone, role, isActive, createdAt, updatedAt };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map