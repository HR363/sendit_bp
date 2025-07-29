import { Request as ExpressRequest } from 'express';
import { UpdateUserProfileDto, UserProfileResponseDto, ChangePasswordDto } from './dto/profile.dto';
import { UsersService } from './users.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: ExpressRequest & {
        user: {
            userId: string;
        };
    }): Promise<UserProfileResponseDto>;
    updateProfile(req: ExpressRequest & {
        user: {
            userId: string;
        };
    }, dto: UpdateUserProfileDto): Promise<UserProfileResponseDto>;
    changePassword(req: ExpressRequest & {
        user: {
            userId: string;
        };
    }, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    listUsers(): Promise<UserProfileResponseDto[]>;
    updateUserStatus(id: string, dto: UpdateUserStatusDto, req: ExpressRequest & {
        user: {
            userId: string;
        };
    }): Promise<UserProfileResponseDto>;
}
