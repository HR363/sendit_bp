import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { UpdateUserProfileDto, UserProfileResponseDto, ChangePasswordDto } from './dto/profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });
    if (!user) throw new NotFoundException('User not found');
    // Map to DTO
    const { id, email, firstName, lastName, phone, role, profilePhoto, isActive, createdAt, updatedAt } = user;
    return { id, email, firstName, lastName, phone, role, profilePhoto: profilePhoto || undefined, isActive, createdAt, updatedAt };
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId, isActive: true },
      data: { ...dto },
    });
    const { id, email, firstName, lastName, phone, role, profilePhoto, isActive, createdAt, updatedAt } = user;
    return { id, email, firstName, lastName, phone, role, profilePhoto: profilePhoto || undefined, isActive, createdAt, updatedAt };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async listUsers(): Promise<UserProfileResponseDto[]> {
    const users = await this.prisma.user.findMany({ where: { }, orderBy: { createdAt: 'desc' } });
    return users.map(({ id, email, firstName, lastName, phone, role, profilePhoto, isActive, createdAt, updatedAt }) => ({
      id, email, firstName, lastName, phone, role, profilePhoto: profilePhoto || undefined, isActive, createdAt, updatedAt
    }));
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto, currentAdminId?: string): Promise<UserProfileResponseDto> {
    // Fetch the user being updated
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // If changing role or deactivating, check if this is the last admin
    const isDemotingAdmin = user.role === 'ADMIN' && dto.role && dto.role !== 'ADMIN';
    const isDeactivatingAdmin = user.role === 'ADMIN' && dto.isActive === false;
    if (isDemotingAdmin || isDeactivatingAdmin) {
      // Count active admins
      const activeAdmins = await this.prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
      if (activeAdmins <= 1) {
        throw new ForbiddenException('Cannot demote or deactivate the last remaining admin');
      }
    }

    // Prevent self-demotion or self-deactivation
    if (currentAdminId && id === currentAdminId) {
      if ((dto.role && dto.role !== 'ADMIN') || dto.isActive === false) {
        throw new ForbiddenException('Admins cannot demote or deactivate themselves');
      }
    }

    const updateData: any = { ...dto, deletedAt: dto.isActive === false ? new Date() : null };
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
}
