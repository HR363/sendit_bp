import { PrismaService } from '../common/database/prisma.service';
import { UpdateUserProfileDto, UserProfileResponseDto, ChangePasswordDto } from './dto/profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<UserProfileResponseDto>;
    updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<UserProfileResponseDto>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    listUsers(): Promise<UserProfileResponseDto[]>;
    updateUserStatus(id: string, dto: UpdateUserStatusDto, currentAdminId?: string): Promise<UserProfileResponseDto>;
}
