export declare class UserProfileResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    profilePhoto?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UpdateUserProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    profilePhoto?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
