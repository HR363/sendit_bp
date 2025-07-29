import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/database/prisma.service';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
export declare class UploadService {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    getMulterOptions(): MulterOptions;
    getProfilePhotoMulterOptions(): MulterOptions;
    uploadProfilePhoto(file: Express.Multer.File, userId: string): Promise<{
        url: string;
    }>;
    uploadDeliveryImage(parcelId: string, file: Express.Multer.File, user: {
        userId: string;
        role: string;
    }): Promise<{
        url: string;
    }>;
}
